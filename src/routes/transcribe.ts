import { Router } from 'express';
import fs from 'fs';
import { getAudioPath } from '../services/audioService';
import { n8nClient } from '../services/n8nClient';
import { saveTranscript } from '../services/transcriptService';

const router = Router();

router.post('/transcribe/:audio_id', async (req, res) => {
  const { audio_id } = req.params;
  try {
    // Validate audio exists
    getAudioPath(audio_id);
  } catch (e: any) {
    return res.status(404).json({ error: e.message });
  }

  try {
    const port = process.env.PORT || 8080;
    const audioUrl = `http://localhost:${port}/files/audio/${audio_id}`;
    const model = process.env.OPENAI_WHISPER_MODEL;
    const language = process.env.OPENAI_WHISPER_LANG;
    const { transcript } = await n8nClient.transcribe(audioUrl, model, language);
    fs.writeFileSync(`reports/${audio_id}_transcript.txt`, transcript);
    saveTranscript(audio_id, transcript);
    res.json({ transcript });
  } catch (e: any) {
    const msg = e.response?.data?.error || e.message || 'Transcripción fallida';
    res.status(500).json({ error: msg });
  }
});

export default router;
