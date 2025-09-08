/**
 * Limita un número dentro de un rango.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Redondea a un número fijo de decimales.
 * @param {number} n
 * @param {number} digits
 * @returns {number}
 */
export function toFixedNumber(n, digits = 2) {
  return Number(n.toFixed(digits));
}

/**
 * Calcula puntajes y agrupaciones a partir del análisis y la matriz.
 * @param {{atributos:Array}} analysis - Resultado del análisis de OpenAI.
 * @param {Array<{atributo:string,categoria:string,peso:number}>} matrix
 * @returns {{notaBase:number,totalDeducciones:number,notaFinal:number,porCategoria:Array,porAtributo:Array}}
 */
export function scoreFromMatrix(analysis, matrix) {
  const notaBase = 100;
  let totalDeducciones = 0;
  const porAtributo = [];
  const categorias = {};

  const analysisMap = new Map();
  (analysis.atributos || []).forEach(a => {
    analysisMap.set(a.atributo.toLowerCase(), a);
  });

  matrix.forEach(m => {
    const key = m.atributo.toLowerCase();
    const a = analysisMap.get(key) || {};
    const cumplido = a.cumplido === true;
    const deduccion = cumplido ? 0 : m.peso;
    if (!cumplido) totalDeducciones += m.peso;

    porAtributo.push({
      atributo: m.atributo,
      categoria: m.categoria,
      peso: m.peso,
      cumplido,
      deduccion,
      justificacion: a.justificacion || 'no evaluado',
      mejora: a.mejora || '',
      reconocimiento: a.reconocimiento || ''
    });

    if (!categorias[m.categoria]) {
      categorias[m.categoria] = {
        cumplidos: 0,
        noCumplidos: 0,
        recomendaciones: new Set()
      };
    }
    if (cumplido) {
      categorias[m.categoria].cumplidos++;
    } else {
      categorias[m.categoria].noCumplidos++;
      if (a.mejora) categorias[m.categoria].recomendaciones.add(a.mejora);
    }
  });

  const notaFinal = clamp(notaBase - totalDeducciones, 0, 100);

  const porCategoria = Object.entries(categorias).map(([categoria, info]) => {
    const total = info.cumplidos + info.noCumplidos;
    const porcentaje = total ? toFixedNumber((info.cumplidos / total) * 100, 2) : 0;
    return {
      categoria,
      cumplimiento: {
        cumplidos: info.cumplidos,
        noCumplidos: info.noCumplidos,
        porcentaje
      },
      recomendaciones: Array.from(info.recomendaciones)
    };
  });

  return { notaBase, totalDeducciones, notaFinal, porCategoria, porAtributo };
}
