import xlsx from 'xlsx';

export interface MatrixRow {
  criterio: string;
  peso: number;
  tipo: 'keyword' | 'regex' | 'always';
  patron: string;
  umbral: number;
}

export const parseMatrix = (filePath: string): MatrixRow[] => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  return json.map((row) => ({
    criterio: String(row.criterio || row.Criterio || ''),
    peso: Number(row.peso || row.Peso || 0),
    tipo: (row.tipo || row.Tipo || 'keyword').toString() as any,
    patron: String(row.patron || row.Patron || ''),
    umbral: Number(row.umbral || row.Umbral || 0),
  }));
};
