import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { parseMatrix, MatrixRow } from '../utils/excel';

let currentMatrix: MatrixRow[] | null = null;

const matrixSchema = z.array(
  z.object({
    criterio: z.string(),
    peso: z.number().min(0).max(1),
    tipo: z.enum(['keyword', 'regex', 'always']),
    patron: z.string(),
    umbral: z.number().min(0).max(1)
  })
);

export const loadMatrix = (file: Express.Multer.File): MatrixRow[] => {
  const tempPath = file.path;
  const matrix = parseMatrix(tempPath);
  const parsed = matrixSchema.parse(matrix);
  const totalPeso = parsed.reduce((sum, r) => sum + r.peso, 0);
  if (Math.abs(totalPeso - 1) > 0.001) {
    throw new Error('La suma de peso debe ser 1.0');
  }
  const ext = path.extname(file.originalname) || '.csv';
  const destPath = `data/matrices/${Date.now()}${ext}`;
  fs.renameSync(tempPath, destPath);
  currentMatrix = parsed;
  return parsed;
};

export const getMatrix = (): MatrixRow[] => {
  if (!currentMatrix) throw new Error('No hay matriz cargada');
  return currentMatrix;
};
