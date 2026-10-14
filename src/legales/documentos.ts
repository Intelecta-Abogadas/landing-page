import type { Legal } from "../piezas";
import datos from "./documentos.json";

/** The studio's text, generated from their Word file by scripts/generar_legales.py. */
export type Parte = { texto: string; negrita: boolean };

export type Bloque =
  | { tipo: "parrafo"; partes: Parte[] }
  | { tipo: "lista"; numerada: boolean; items: Parte[][] };

export type Clausula = { numero: number; titulo: string; bloques: Bloque[] };

export type Documento = { titulo: string; inicio: Bloque[]; clausulas: Clausula[] };

export const DOCUMENTOS = datos as Record<Legal, Documento>;

const ENLAZABLE = /(https?:\/\/\S+?)(?=[.,;:]?(?:\s|$))|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\+\d[\d -]{7,}\d)/g;

export type Tramo = { texto: string; href?: string };

/** Splits a run of text so the site, the mail and the phone the studio wrote become links. */
export function tramos(texto: string): Tramo[] {
  const salida: Tramo[] = [];
  let desde = 0;
  for (const hallado of texto.matchAll(ENLAZABLE)) {
    const [valor, sitio, correo] = hallado;
    const inicio = hallado.index ?? 0;
    if (inicio > desde) salida.push({ texto: texto.slice(desde, inicio) });
    const href = sitio ? valor : correo ? `mailto:${valor}` : `tel:${valor.replace(/[^\d+]/g, "")}`;
    salida.push({ texto: valor, href });
    desde = inicio + valor.length;
  }
  if (desde < texto.length) salida.push({ texto: texto.slice(desde) });
  return salida;
}
