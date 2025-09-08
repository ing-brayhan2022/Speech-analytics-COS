import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analiza una transcripción con base en una matriz de calidad.
 * @param {{transcript:string, matrix:Array<{atributo:string,categoria:string,peso:number,criterio?:string}>}} params
 * @returns {Promise<{resumen:string, hallazgos:string[], atributos:Array}>}
 */
export async function analyzeTranscriptWithMatrix({ transcript, matrix }) {
  const matrixAsText = matrix
    .map(m => `- ${m.atributo} | ${m.categoria} | ${m.peso} | "${m.criterio || ''}"`)
    .join('\n');

  const systemPrompt = 'Eres un analista de calidad experto en contact center. Evalúas transcripciones de llamadas con base en una matriz de calidad. Respondes únicamente en JSON válido y en español siguiendo el esquema solicitado. Para cada atributo: determina si se evidencia (cumplido=true) o no se evidencia (cumplido=false). Proporciona justificación breve con citas o referencias textuales cuando existan, o indica “no evidenciado”. Si no se cumple, da una sugerencia de mejora concreta y accionable; si se cumple, agrega un reconocimiento específico.';

  const userPrompt = `MATRIZ (atributo, categoría, peso, criterio opcional):\n${matrixAsText}\n\nTRANSCRIPCIÓN:\n${transcript}\n\nDevuelve JSON ESTRICTAMENTE con el siguiente esquema:\n{\n  "resumen": "string (100-150 palabras)",\n  "hallazgos": ["string", "string", "string"],\n  "atributos": [\n    {\n      "atributo": "string",\n      "categoria": "string",\n      "cumplido": true|false,\n      "justificacion": "string",\n      "mejora": "string",\n      "reconocimiento": "string"\n    }\n  ]\n}\nNo incluyas comentarios ni texto adicional fuera del JSON.`;

  let attempt = 0;
  while (attempt < 2) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0
      });
      const content = completion.choices[0].message.content.trim();
      try {
        return JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
        throw new Error('Respuesta no es JSON válido');
      }
    } catch (err) {
      attempt++;
      if (attempt >= 2) throw err;
    }
  }
}
