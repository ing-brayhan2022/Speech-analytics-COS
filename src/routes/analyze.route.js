import { Router } from 'express';
import multer from 'multer';
import { parseMatrixFromXlsx } from '../services/matrixService.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { analyzeTranscriptWithMatrix } from '../services/analysisService.js';
import { scoreFromMatrix } from '../services/scoringService.js';
import fs from 'fs';
import path from 'path';

const router = Router();
const upload = multer();

router.post('/', upload.fields([{ name: 'matrix', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const matrixFile = req.files?.matrix?.[0];
    const audioFile = req.files?.audio?.[0];
    if (!matrixFile || !audioFile) {
      return res.status(400).json({ error: 'Archivos requeridos', detail: 'matrix y audio son obligatorios', hint: 'envíe ambos archivos en multipart/form-data' });
    }

    let matrix;
    try {
      matrix = parseMatrixFromXlsx(matrixFile.buffer);
    } catch (err) {
      return res.status(422).json({ error: 'Matriz inválida', detail: err.message, hint: 'verifique columnas y pesos numéricos' });
    }

    const { callId, agentName, customerName, language = 'es-ES', channel = 'voz' } = req.body;

    let transcript;
    try {
      const tr = await transcribeAudio(audioFile.buffer, audioFile.originalname, language);
      transcript = tr.text;
    } catch (err) {
      return res.status(500).json({ error: 'Transcripción fallida', detail: err.message, hint: 'verifique formato/idioma/clave' });
    }

    let analysis;
    try {
      analysis = await analyzeTranscriptWithMatrix({ transcript, matrix });
    } catch (err) {
      return res.status(500).json({ error: 'Análisis fallido', detail: err.message, hint: 'revise la configuración del modelo' });
    }

    const consolidado = scoreFromMatrix(analysis, matrix);

    const metadata = { callId, agentName, customerName, language, channel };

    const response = {
      metadata,
      transcript,
      analisis: {
        resumen: analysis.resumen,
        hallazgos: analysis.hallazgos
      },
      consolidado
    };

    // Generate report
    const reportName = `${callId || Date.now()}.md`;
    const reportPath = path.join('reports', reportName);
    const lines = [];
    lines.push(`# Reporte de llamada`);
    lines.push(`\n**Call ID:** ${callId || ''}`);
    lines.push(`\n**Agente:** ${agentName || ''}`);
    lines.push(`\n**Cliente:** ${customerName || ''}`);
    lines.push(`\n**Idioma:** ${language}`);
    lines.push(`\n**Canal:** ${channel}`);
    lines.push(`\n## Nota final: ${consolidado.notaFinal}`);
    lines.push(`\n### Deducciones por atributo`);
    lines.push(`| Atributo | Peso | Cumplido | Deducción |`);
    lines.push(`| --- | --- | --- | --- |`);
    consolidado.porAtributo.forEach(a => {
      lines.push(`| ${a.atributo} | ${a.peso} | ${a.cumplido ? 'Sí' : 'No'} | ${a.deduccion} |`);
    });
    lines.push(`\n### Resumen por categoría`);
    consolidado.porCategoria.forEach(c => {
      lines.push(`\n#### ${c.categoria}`);
      lines.push(`\n- Cumplimiento: ${c.cumplimiento.porcentaje}%`);
      if (c.recomendaciones.length) {
        lines.push(`\n- Recomendaciones:`);
        c.recomendaciones.forEach(r => lines.push(`  - ${r}`));
      }
    });
    lines.push(`\n### Resumen ejecutivo`);
    lines.push(analysis.resumen);
    lines.push(`\n### Hallazgos clave`);
    analysis.hallazgos.forEach(h => lines.push(`- ${h}`));

    fs.writeFileSync(reportPath, lines.join('\n'));
    response.reportPath = reportPath;

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Error inesperado', detail: err.message, hint: 'revise la solicitud' });
  }
});

export default router;
