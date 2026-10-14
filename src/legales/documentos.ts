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

const ESPECIAL =
  /(https?:\/\/\S+?)(?=[.,;:]?(?:\s|$))|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\+\d[\d -]{7,}\d)|(\b\d{2}-\d{8}-\d\b)/g;

/** `entero` keeps a CUIT or a phone number on one line. */
export type Tramo = { texto: string; href?: string; entero?: boolean };

/** Splits a run of text so the site, the mail and the phone the studio wrote become links, and marks the CUITs. */
export function tramos(texto: string): Tramo[] {
  const salida: Tramo[] = [];
  let desde = 0;
  for (const hallado of texto.matchAll(ESPECIAL)) {
    const [valor, sitio, correo, telefono] = hallado;
    const inicio = hallado.index ?? 0;
    if (inicio > desde) salida.push({ texto: texto.slice(desde, inicio) });
    if (sitio) salida.push({ texto: valor, href: valor });
    else if (correo) salida.push({ texto: valor, href: `mailto:${valor}` });
    else if (telefono) salida.push({ texto: valor, href: `tel:${valor.replace(/[^\d+]/g, "")}`, entero: true });
    else salida.push({ texto: valor, entero: true });
    desde = inicio + valor.length;
  }
  if (desde < texto.length) salida.push({ texto: texto.slice(desde) });
  return salida;
}
