import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const transcribePath = process.env.N8N_TRANSCRIBE_PATH || '/webhook/transcribe';
const scorePath = process.env.N8N_SCORE_PATH || '/webhook/score';

export const n8nClient = {
  async transcribe(audioPath: string) {
    const { data } = await axios.post(`${baseURL}${transcribePath}`, {
      audioPath,
      openAiKey: process.env.OPENAI_API_KEY || undefined
    });
    return data as { transcript: string };
  },
  async score(transcript: string, matrix: any[]) {
    const { data } = await axios.post(`${baseURL}${scorePath}`, {
      transcript,
      matrix
    });
    return data as { total: number; breakdown: any[] };
  }
};
