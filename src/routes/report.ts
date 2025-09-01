import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { readCSV, writeConsolidatedCSV } from '../utils/csv';
import { getScore } from '../services/transcriptService';

const router = Router();

router.get('/report/:audio_id', (req, res) => {
  const file = `reports/${req.params.audio_id}_score.csv`;
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Reporte inexistente' });
  res.download(file);
});

router.get('/report/consolidated', async (_req, res) => {
  const files = fs.readdirSync('reports').filter(f => f.endsWith('_score.csv'));
  const rows: any[] = [];
  for (const file of files) {
    const audio_id = file.split('_')[0];
    const total = getScore(audio_id) || 0;
    const records = readCSV(path.join('reports', file));
    records.forEach(r => rows.push({ audio_id, total, ...r }));
  }
  await writeConsolidatedCSV(rows);
  res.download('reports/consolidated.csv');
});

export default router;
