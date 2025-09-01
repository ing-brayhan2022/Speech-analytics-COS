import { MatrixRow } from '../utils/excel';
import { normalize, tokenize } from '../utils/text';

export interface Breakdown {
  criterio: string;
  peso: number;
  tipo: string;
  patron: string;
  umbral: number;
  cumplimiento: number;
  puntaje_parcial: number;
}

export const scoreTranscript = (transcript: string, matrix: MatrixRow[]): { total: number; breakdown: Breakdown[] } => {
  const tokens = tokenize(transcript);
  const totalTokens = tokens.length || 1;
  const breakdown = matrix.map((row) => {
    let cumplimiento = 0;
    if (row.tipo === 'always') {
      cumplimiento = 1;
    } else if (row.tipo === 'keyword') {
      const alts = row.patron.split('|').map(a => normalize(a));
      const found = alts.filter(a => transcript.includes(a));
      cumplimiento = found.length / alts.length;
      if (cumplimiento > row.umbral) cumplimiento = 1;
    } else if (row.tipo === 'regex') {
      const regex = new RegExp(row.patron, 'g');
      const matches = transcript.match(regex);
      cumplimiento = Math.min((matches ? matches.length : 0) / totalTokens, 1);
      if (cumplimiento > row.umbral) cumplimiento = 1;
    }
    const puntaje_parcial = cumplimiento * row.peso;
    return { ...row, cumplimiento, puntaje_parcial };
  });
  const total = breakdown.reduce((s, r) => s + r.puntaje_parcial, 0);
  return { total, breakdown };
};
