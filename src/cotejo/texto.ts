/**
 * Normalización y tokens de una denominación, como `scoring/stopwords.py` y
 * `scoring/spanish_phonetic.py` del backend.
 */
import { PALABRAS_VACIAS } from "./datos";

export const LARGO_MINIMO = 3;

// Python's `\b` and `\w` count accented letters as part of a word; JavaScript's do not
// («inc» would be cut out of «incómodas»), so the word edges are written out.
const LETRA = "[\\p{L}\\p{M}\\p{N}_]";

function abreviatura(cuerpo: string): RegExp {
  const inicio = `(?<!${LETRA})(?=${LETRA})`;
  const fin = `(?:(?<=${LETRA})(?!${LETRA})|(?<!${LETRA})(?=${LETRA}))`;
  return new RegExp(`${inicio}${cuerpo}${fin}`, "giu");
}

const ABREVIATURAS: Array<[RegExp, string]> = [
  [abreviatura("s\\s*\\.\\s*a\\s*\\.\\s*s\\s*\\.?"), " sas "],
  [abreviatura("s\\s*\\.\\s*r\\s*\\.\\s*l\\s*\\.?"), " srl "],
  [abreviatura("s\\s*\\.\\s*a\\s*\\.?"), " sa "],
  [abreviatura("l\\s*\\.\\s*t\\s*\\.\\s*d\\s*\\.?"), " ltda "],
  [abreviatura("s\\s*\\.\\s*l\\s*\\.?"), " sl "],
  [abreviatura("l\\s*\\.\\s*l\\s*\\.\\s*c\\s*\\.?"), " llc "],
  [abreviatura("inc\\s*\\.?"), " inc "],
];

const POSESIVO = new RegExp(`(${LETRA})'s(?!${LETRA})`, "giu");

const INICIALES_CON_PUNTO = /(?<![a-z])(?:[a-z]\.){2,}[a-z]\.?(?![a-z])/gi;

export function sinAcentos(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function normalizarDenominacion(crudo: string): string {
  let s = crudo.trim();
  for (const [patron, reemplazo] of ABREVIATURAS) s = s.replace(patron, reemplazo);
  s = s.replace(POSESIVO, "$1s");
  return s.replace(INICIALES_CON_PUNTO, (m) => m.replace(/\./g, ""));
}

export function tokenizar(crudo: string): string[] {
  const s = sinAcentos(crudo.toLowerCase().replace(/ñ/g, "ny"));
  return s.match(/[a-z]+/g) ?? [];
}

export function tokensDeContenido(crudo: string): string[] {
  return tokenizar(normalizarDenominacion(crudo)).filter((t) => !PALABRAS_VACIAS.has(t));
}

export function tokensSignificativos(crudo: string): string[] {
  const tokens = tokenizar(normalizarDenominacion(crudo));
  if (!tokens.length) return [];
  let filtrados = tokens.filter((t) => !PALABRAS_VACIAS.has(t));
  if (!filtrados.length) return tokens;
  if (filtrados.some((t) => t.length >= LARGO_MINIMO)) {
    const sinSueltas = filtrados.filter((t) => t.length > 1);
    filtrados = sinSueltas.length ? sinSueltas : filtrados;
  }
  if (filtrados.some((t) => t.length >= LARGO_MINIMO)) {
    const largos = filtrados.filter((t) => t.length >= LARGO_MINIMO);
    filtrados = largos.length ? largos : filtrados;
  }
  return filtrados.length ? filtrados : tokens;
}
