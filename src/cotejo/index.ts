/**
 * El filtro previo del backend (`marcas_service/scoring`, versión en `datos.ts`), para correr
 * en el navegador: las cuatro formas de parecido entre dos denominaciones y el máximo que
 * decide si el par pasa a la revisión. Las pruebas lo comparan contra el Python original.
 */
import { PALABRAS_GENERICAS, PESO_GENERICA } from "./datos";
import { claveCastellana, metaphoneCastellano, metaphoneIngles } from "./fonetica";
import { jaroWinkler, ratio, wRatio } from "./fuzz";
import { LARGO_MINIMO, tokensDeContenido, tokensSignificativos } from "./texto";

export const UMBRAL = 0.7;

export type Dimension = "literal" | "castellano" | "ingles" | "contencion";

export type Cotejo = Record<Dimension, number> & { parecido: number; principal: Dimension };

const PISO_PAR = 0.7;
const PISO_CODIFICADOR = 0.58;
const PISO_IDENTICA = 0.8;
const PISO_FUSION = 0.85;
const PALABRA_CONTENIDA = 0.95;
const TOPE_LITERAL_DEBAJO = 0.42;
const TOPE_LITERAL = 0.68;

const pesoGenerico = (a: string, b: string) =>
  PALABRAS_GENERICAS.has(a) || PALABRAS_GENERICAS.has(b) ? PESO_GENERICA : 1;

const comparables = (la: number, lb: number) => la > 0 && lb > 0 && Math.min(la, lb) * 2 >= Math.max(la, lb);

const cortas = (a: string, b: string) => Math.min(a.length, b.length) < LARGO_MINIMO;

function literal(a: string, b: string): number {
  const na = tokensSignificativos(a).join(" ");
  const nb = tokensSignificativos(b).join(" ");
  if (!na || !nb) return 0;
  const base = 0.46 * (wRatio(na, nb) / 100) + 0.54 * (ratio(na, nb) / 100);
  const completo = ratio(na, nb) / 100;
  const proporcion = Math.max(na.length, nb.length) / Math.max(Math.min(na.length, nb.length), 1);
  if (proporcion <= 1.4) return Math.min(1, Math.max(0, base));
  const mezcla = Math.max(0.1, 1 - (proporcion - 1.4) / 5);
  return Math.min(1, Math.max(0, completo + (base - completo) * mezcla));
}

const similitudDeClaves = (k1: string, k2: string) => Math.min(jaroWinkler(k1, k2), ratio(k1, k2) / 100);

function porClave(codificar: (w: string) => string) {
  return (w1: string, w2: string) => {
    const k1 = codificar(w1);
    const k2 = codificar(w2);
    if (!k1 || !k2) return 0;
    if (k1 === k2) return 1;
    if (cortas(w1, w2)) return 0;
    return similitudDeClaves(k1, k2);
  };
}

const parPropio = porClave(claveCastellana);
const parMetaphone = porClave((w) => metaphoneCastellano(w));

function parCastellano(w1: string, w2: string): number {
  const propio = parPropio(w1, w2);
  if (propio < PISO_CODIFICADOR) return 0;
  const meta = parMetaphone(w1, w2);
  if (meta < PISO_CODIFICADOR) return 0;
  return (propio * 1.5 + meta) / 2.5;
}

function parIngles(w1: string, w2: string): number {
  if (cortas(w1, w2)) return w1 === w2 ? 1 : 0;
  const m1 = metaphoneIngles(w1);
  const m2 = metaphoneIngles(w2);
  if (!m1 || !m2) return 0;
  if (m1 === m2) return 1;
  return jaroWinkler(m1, m2);
}

function mejorPar(a: string, b: string, par: (w1: string, w2: string) => number): number {
  const ta = tokensSignificativos(a);
  const tb = tokensSignificativos(b);
  let mejor = 0;
  for (const w of ta) {
    for (const u of tb) {
      if (!comparables(w.length, u.length)) continue;
      const s = par(w, u) * pesoGenerico(w, u);
      if (s < PISO_PAR) continue;
      if (s > mejor) {
        mejor = s;
        if (mejor >= 1) return 1;
      }
    }
  }
  return mejor;
}

function permutaciones(xs: string[], n: number): string[][] {
  if (n === 0) return [[]];
  const res: string[][] = [];
  xs.forEach((x, i) => {
    const resto = [...xs.slice(0, i), ...xs.slice(i + 1)];
    for (const p of permutaciones(resto, n - 1)) res.push([x, ...p]);
  });
  return res;
}

function fusion(ta: string[], tb: string[]): number {
  let mejor = 0;
  for (const [una, otra] of [
    [ta, tb],
    [tb, ta],
  ]) {
    for (const w of una) {
      if (w.length < 5) continue;
      for (const n of [2, 3]) {
        if (otra.length < n) continue;
        for (const combo of permutaciones(otra, n)) {
          const s = ratio(w, combo.join("")) / 100;
          if (s >= PISO_FUSION && s > mejor) mejor = s;
        }
      }
    }
  }
  return mejor;
}

function sigla(a: string, b: string): number {
  for (const [una, otra] of [
    [a, b],
    [b, a],
  ]) {
    const t = tokensSignificativos(una);
    if (!t.length || t.some((x) => x.length >= LARGO_MINIMO)) continue;
    const letras = t.filter((x) => x.length >= 2);
    const contenido = tokensDeContenido(otra);
    if (letras.length && letras.every((x) => contenido.includes(x))) return 1;
  }
  return 0;
}

function anclada(w: string, u: string): boolean {
  const [corta, larga] = w.length <= u.length ? [w, u] : [u, w];
  const hace = Math.max(3, Math.floor(corta.length * 0.75));
  return larga.slice(0, hace) === corta.slice(0, hace);
}

function contencion(a: string, b: string): number {
  const ta = tokensSignificativos(a);
  const tb = tokensSignificativos(b);
  if (!ta.length || !tb.length) return 0;
  let mejor = Math.max(fusion(ta, tb), sigla(a, b));
  if (mejor >= 1) return 1;
  for (const w of ta) {
    for (const u of tb) {
      if (!comparables(w.length, u.length)) continue;
      const exacta = w === u;
      if (!exacta && !anclada(w, u)) continue;
      let peso = pesoGenerico(w, u);
      if (exacta) peso = Math.max(peso, PISO_IDENTICA);
      const s = (ratio(w, u) / 100) * peso;
      if (s < PISO_PAR) continue;
      if (s > mejor) {
        mejor = s;
        if (mejor >= 1) return 1;
      }
    }
  }
  return mejor;
}

export function cotejar(a: string, b: string): Cotejo {
  const lit = literal(a, b);
  const es = mejorPar(a, b, parCastellano);
  const enCrudo = mejorPar(a, b, parIngles);
  const ext = contencion(a, b);
  const en = Math.min(1, enCrudo * Math.max(es, lit));

  const orden: Array<[Dimension, number]> = [
    ["literal", lit],
    ["castellano", es],
    ["ingles", en],
    ["contencion", ext],
  ];
  let [principal, parecido] = orden[0];
  for (const [d, v] of orden.slice(1)) {
    if (v > parecido) [principal, parecido] = [d, v];
  }
  if (lit < TOPE_LITERAL_DEBAJO && ext < PALABRA_CONTENIDA) parecido = Math.min(parecido, TOPE_LITERAL);

  return { literal: lit, castellano: es, ingles: en, contencion: ext, parecido, principal };
}

export type Clave = { palabra: string; castellano: string; metaphone: string; ingles: string };

export function claves(denominacion: string): Clave[] {
  return tokensSignificativos(denominacion).map((p) => ({
    palabra: p,
    castellano: claveCastellana(p),
    metaphone: metaphoneCastellano(p),
    ingles: metaphoneIngles(p),
  }));
}
