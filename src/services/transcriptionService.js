import dotenv from 'dotenv';
import OpenAI from 'openai';
import { File } from 'node:buffer';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribe un audio usando OpenAI Whisper.
 * @param {Buffer} buffer - Contenido del archivo de audio.
 * @param {string} filename - Nombre del archivo original.
 * @param {string} language - Código de idioma (ej. es-ES).
 * @returns {Promise<{text: string}>}
 */
export async function transcribeAudio(buffer, filename, language) {
  const file = new File([buffer], filename);
  let attempt = 0;
  while (attempt < 2) {
    try {
      const response = await openai.audio.transcriptions.create({
        model: process.env.OPENAI_TRANSCRIPTION_MODEL,
        file,
        language
      });
      return response;
    } catch (err) {
      attempt++;
      if (attempt >= 2) throw err;
    }
  }
}
