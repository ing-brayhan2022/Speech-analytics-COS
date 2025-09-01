import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

export const writeScoreCSV = async (audioId: string, breakdown: any[]) => {
  const path = `reports/${audioId}_score.csv`;
  const csvWriter = createObjectCsvWriter({
    path,
    header: [
      { id: 'criterio', title: 'criterio' },
      { id: 'peso', title: 'peso' },
      { id: 'tipo', title: 'tipo' },
      { id: 'patron', title: 'patron' },
      { id: 'umbral', title: 'umbral' },
      { id: 'cumplimiento', title: 'cumplimiento' },
      { id: 'puntaje_parcial', title: 'puntaje_parcial' }
    ]
  });
  await csvWriter.writeRecords(breakdown);
  return path;
};

export const writeConsolidatedCSV = async (rows: any[]) => {
  const path = `reports/consolidated.csv`;
  const csvWriter = createObjectCsvWriter({
    path,
    header: [
      { id: 'audio_id', title: 'audio_id' },
      { id: 'total', title: 'total' },
      { id: 'criterio', title: 'criterio' },
      { id: 'peso', title: 'peso' },
      { id: 'tipo', title: 'tipo' },
      { id: 'patron', title: 'patron' },
      { id: 'umbral', title: 'umbral' },
      { id: 'cumplimiento', title: 'cumplimiento' },
      { id: 'puntaje_parcial', title: 'puntaje_parcial' }
    ]
  });
  await csvWriter.writeRecords(rows);
  return path;
};

export const readCSV = (filePath: string): any[] => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj: any = {};
    headers.forEach((h, i) => obj[h] = cols[i]);
    return obj;
  });
};
