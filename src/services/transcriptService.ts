import fs from 'fs';

interface DB { [key: string]: { transcript?: string; score?: { total: number } } }

const dbPath = 'data/db.json';
let db: DB = {};

if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
}

const saveDB = () => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

export const saveTranscript = (audioId: string, transcript: string) => {
  if (!db[audioId]) db[audioId] = {};
  db[audioId].transcript = transcript;
  saveDB();
};

export const getTranscript = (audioId: string): string => {
  const t = db[audioId]?.transcript;
  if (!t) throw new Error('Transcripción inexistente');
  return t;
};

export const saveScore = (audioId: string, total: number) => {
  if (!db[audioId]) db[audioId] = {};
  db[audioId].score = { total };
  saveDB();
};

export const getScore = (audioId: string): number | undefined => {
  return db[audioId]?.score?.total;
};
