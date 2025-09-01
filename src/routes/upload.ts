import { Router } from 'express';
import multer from 'multer';
import { loadMatrix } from '../services/matrixService';
import { saveAudio } from '../services/audioService';

const router = Router();
const upload = multer({ dest: 'tmp/' });

router.post('/upload/matrix', upload.single('file'), (req, res) => {
  try {
    if (!req.file) throw new Error('Archivo requerido');
    const matrix = loadMatrix(req.file);
    res.json({ ok: true, rows: matrix.length });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/upload/audio', upload.single('file'), (req, res) => {
  try {
    if (!req.file) throw new Error('Archivo requerido');
    const audioId = saveAudio(req.file);
    res.json({ audio_id: audioId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
