import fs from 'fs';
import path from 'path';
import { generateId } from '../utils/id';

const allowed = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];

export const saveAudio = (file: Express.Multer.File): string => {
  if (!allowed.includes(file.mimetype)) {
    throw new Error('Tipo de audio no soportado');
  }
  const audioId = generateId();
  const ext = path.extname(file.originalname);
  const dest = `data/audios/${audioId}${ext}`;
  fs.renameSync(file.path, dest);
  return audioId;
};

export const getAudioPath = (audioId: string): string => {
  const files = fs.readdirSync('data/audios');
  const file = files.find(f => f.startsWith(audioId));
  if (!file) throw new Error('audio_id inexistente');
  return `data/audios/${file}`;
};
