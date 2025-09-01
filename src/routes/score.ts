import { Router } from 'express';
import { getMatrix } from '../services/matrixService';
import { getTranscript, saveScore } from '../services/transcriptService';
import { n8nClient } from '../services/n8nClient';
import { writeScoreCSV } from '../utils/csv';
import { scoreTranscript } from '../services/scoringService';

const router = Router();

router.post('/score/:audio_id', async (req, res) => {
  const { audio_id } = req.params;
  try {
    const transcript = getTranscript(audio_id);
    const matrix = getMatrix();
    let result;
    try {
      result = await n8nClient.score(transcript, matrix);
    } catch {
      result = scoreTranscript(transcript, matrix);
    }
    await writeScoreCSV(audio_id, result.breakdown);
    saveScore(audio_id, result.total);
    res.json({ total: result.total });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
