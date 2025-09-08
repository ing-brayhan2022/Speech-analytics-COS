import xlsx from 'xlsx';

/**
 * Lee y valida la matriz de calidad desde un archivo Excel.
 * @param {Buffer} buffer - Contenido del archivo xlsx.
 * @returns {Array<{atributo:string, categoria:string, peso:number, criterio?:string}>}
 * @throws {Error} Cuando faltan columnas requeridas o los datos son inválidos.
 */
export function parseMatrixFromXlsx(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length === 0) throw new Error('Hoja de cálculo vacía');

  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  const idxAtributo = headers.indexOf('atributo');
  const idxCategoria = headers.indexOf('categoria');
  const idxPeso = headers.indexOf('peso');
  const idxCriterio = headers.indexOf('criterio');

  if (idxAtributo === -1 || idxCategoria === -1 || idxPeso === -1) {
    throw new Error('Columnas requeridas: Atributo, Categoria, Peso');
  }

  const matrix = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const atributo = String(row[idxAtributo] || '').trim();
    const categoria = String(row[idxCategoria] || '').trim();
    const pesoRaw = row[idxPeso];
    const peso = Number(pesoRaw);
    const criterio = idxCriterio !== -1 ? String(row[idxCriterio] || '').trim() : undefined;

    if (!atributo || !categoria) {
      throw new Error(`Fila ${i + 1}: atributo y categoría son obligatorios`);
    }
    if (isNaN(peso) || peso < 0) {
      throw new Error(`Fila ${i + 1}: Peso debe ser numérico y >= 0`);
    }
    matrix.push({ atributo, categoria, peso, ...(criterio ? { criterio } : {}) });
  }
  return matrix;
}
