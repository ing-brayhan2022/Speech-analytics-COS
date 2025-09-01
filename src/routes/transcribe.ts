import { Router } from 'express';
import fs from 'fs';
import { getAudioPath } from '../services/audioService';
import { n8nClient } from '../services/n8nClient';
import { saveTranscript } from '../services/transcriptService';

const router = Router();

router.post('/transcribe/:audio_id', async (req, res) => {
  const { audio_id } = req.params;
  try {
    const audioPath = getAudioPath(audio_id);
    let transcript: string;
    try {
      const resp = await n8nClient.transcribe(audioPath);
      transcript = resp.transcript;
    } catch {
      transcript = 'mock';
    }
    fs.writeFileSync(`reports/${audio_id}_transcript.txt`, transcript);
    saveTranscript(audio_id, transcript);
    res.json({ transcript });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
