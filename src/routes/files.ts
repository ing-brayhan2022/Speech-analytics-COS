import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getAudioPath } from '../services/audioService';

const router = Router();

router.get('/files/audio/:audioId', (req, res) => {
  const { audioId } = req.params;
  try {
    const filePath = getAudioPath(audioId);
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.mp4': 'audio/mp4',
      '.ogg': 'audio/ogg'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'audio_id inexistente' });
  }
});

export default router;
