import type { Coincidencia, EstadoDelCupo, Falla } from "./tipos";

/** The groups of the results, from the closest, with what puts a mark in each. */
export const COINCIDENCIAS: Array<{ v: Coincidencia; t: string; ayuda: string }> = [
  { v: "igual", t: "Iguales", ayuda: "Se escriben igual que la que buscaste." },
  { v: "suena_igual", t: "Suenan igual", ayuda: "Escritas de otra manera, se pronuncian igual: c, s y z; b y v; k y qu; la h que no suena." },
  { v: "muy_parecida", t: "Muy parecidas", ayuda: "Se escriben o suenan casi igual." },
  { v: "palabra", t: "Comparten una palabra", ayuda: "Llevan adentro, entre otras, las palabras de la que buscaste." },
  { v: "parecida", t: "Parecidas", ayuda: "Se parecen por cómo se escriben o cómo suenan, menos que las anteriores." },
];

export const ESTADO_INPI: Record<string, { t: string; color: "verde" | "ambar" }> = {
  EN_TRAMITE: { t: "En trámite", color: "ambar" },
  CONCEDIDA: { t: "Concedida", color: "verde" },
};

export const TIPO_MARCA: Record<string, string> = {
  DENOMINATIVA: "Denominativa",
  FIGURATIVA: "Figurativa",
  MIXTA: "Mixta",
  TRIDIMENSIONAL: "Tridimensional",
  SONORA: "Sonora",
  OLFATIVA: "Olfativa",
  MOVIMIENTO: "De movimiento",
  POSICION: "De posición",
  TACTIL: "Táctil",
  COLOR: "De color",
  TRADE_DRESS: "Trade dress",
  GUSTATIVA: "Gustativa",
  UNKNOWN: "Sin dato",
};

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "o", "u", "en", "por", "con", "da", "do", "dos", "das", "van", "von"]);
const SIGLAS_SOCIETARIAS = new Set(["SA", "SAS", "SAU", "SRL", "SAIC", "SACI", "SACIF", "SAICA", "SAICYF", "SCA", "SGR", "SH", "UTE", "SAPEM", "SE"]);

function palabraVisible(p: string, primera: boolean): string {
  const letras = p.replace(/[^\p{L}]/gu, "");
  if (!letras || p.includes(".")) return p;
  if (SIGLAS_SOCIETARIAS.has(letras) || /^[IVX]{1,4}$/.test(letras)) return p;
  if (letras.length > 1 && !/[AEIOUÁÉÍÓÚÜÀÈÌÒÙ]/u.test(letras)) return p;
  const minus = p.toLocaleLowerCase("es");
  if (!primera && PARTICULAS.has(letras.toLocaleLowerCase("es"))) return minus;
  return minus.replace(/(^|[-'’(])(\p{L})/gu, (_, antes: string, letra: string) => antes + letra.toLocaleUpperCase("es"));
}

/**
 * The INPI writes names in capitals ("TOSTADERO QUIMBAYA SRL"); the page shows them with initial
 * capitals ("Tostadero Quimbaya SRL"), as the app does. A name with any lowercase letter stays as
 * it came; company types, acronyms without vowels and roman numerals keep their capitals.
 */
export function nombreVisible(nombre: string | null | undefined): string {
  const s = (nombre ?? "").trim();
  if (!s || /\p{Ll}/u.test(s) || !/\p{Lu}.*\p{Lu}/u.test(s)) return s;
  let primera = true;
  return s
    .split(/(\s+)/)
    .map((p) => {
      if (p === "" || /^\s+$/.test(p)) return p;
      const r = palabraVisible(p, primera);
      primera = false;
      return r;
    })
    .join("");
}

/** A status the app does not name yet, as the INPI wrote it but without the capitals. */
export function estadoVisible(estado: string | null, estadoInpi: string | null): { t: string; color: "verde" | "ambar" | "gris" } {
  if (estado && ESTADO_INPI[estado]) return ESTADO_INPI[estado];
  const crudo = (estadoInpi ?? "").trim().toLocaleLowerCase("es");
  return { t: crudo ? crudo[0]!.toLocaleUpperCase("es") + crudo.slice(1) : "Sin dato", color: "gris" };
}

/** "a", "a y b", "a, b y c". */
export function conY(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

export function textoDeClases(clases: number[]): string {
  if (clases.length === 0) return "Todas las clases";
  if (clases.length === 1) return `Clase ${clases[0]}`;
  if (clases.length <= 4) return `Clases ${conY(clases.map(String))}`;
  return `${clases.length} clases`;
}

/** 4778990 → 4.778.990 */
export const actaConPuntos = (acta: string) => (/^\d+$/.test(acta) ? Number(acta).toLocaleString("es-AR") : acta);

export const urlActaInpi = (acta: string) => `https://portaltramites.inpi.gob.ar/MarcasConsultas/Resultado?Acta=${acta}`;

const dos = (n: number) => String(n).padStart(2, "0");

/** "2026-09-16" → "16/09/2026". */
export function fechaDeDia(dia: string | null): string {
  const m = dia ? /^(\d{4})-(\d{2})-(\d{2})/.exec(dia) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "-";
}

/** An instant as the day it is in Argentina (UTC−3 all year): "19/01/2027". */
export function diaArgentino(instante: string): string {
  const d = new Date(new Date(instante).getTime() - 3 * 3_600_000);
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

const primerNombre = (nombre: string | null) => nombreVisible(nombre).split(/\s+/)[0] ?? "";
const conMayuscula = (s: string) => (s ? s[0]!.toLocaleUpperCase("es") + s.slice(1) : s);

/** The line next to the meter: how many searches are left and until when. */
export function textoDelCupo(e: EstadoDelCupo): string {
  if (!e.conDatos) {
    if (e.restantes === 0) return `Usaste las ${e.cupo} búsquedas sin dejar tus datos.`;
    return e.restantes === 1
      ? `Te queda 1 de ${e.cupo} búsquedas sin dejar tus datos.`
      : `Te quedan ${e.restantes} de ${e.cupo} búsquedas sin dejar tus datos.`;
  }
  const nombre = primerNombre(e.nombre);
  const saludo = nombre ? `${nombre}, ` : "";
  if (e.vencido) return conMayuscula(`${saludo}terminó tu plazo de búsquedas.`);
  const hasta = e.vence ? ` Podés buscar hasta el ${diaArgentino(e.vence)}.` : "";
  if (e.restantes === 0) return conMayuscula(`${saludo}ya hiciste las ${e.cupo} búsquedas de hoy. Mañana tenés ${e.cupo} más.${hasta}`);
  const quedan = e.restantes === 1 ? `te queda 1 de ${e.cupo} búsquedas de hoy.` : `te quedan ${e.restantes} de ${e.cupo} búsquedas de hoy.`;
  return conMayuscula(`${saludo}${quedan}${hasta}`);
}

const TEXTO_DE_FALLA: Record<string, string> = {
  denominacion_invalida: "Escribí el nombre de la marca, de 4 a 80 letras.",
  inpi_no_responde: "El INPI no está respondiendo ahora. Probá en unos minutos: esta búsqueda no se descuenta.",
  error: "No se pudo buscar. Probá en unos minutos: esta búsqueda no se descuenta.",
  origen_ajeno: "No se pudo buscar. Probá en unos minutos: esta búsqueda no se descuenta.",
  demasiadas: "Hiciste muchas búsquedas seguidas. Esperá unos minutos y probá de nuevo.",
  sin_conexion: "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.",
  nombre_invalido: "Escribí tu nombre y tu apellido.",
  correo_invalido: "Revisá el correo.",
  whatsapp_invalido: "No reconocemos ese número. Revisá el país y la característica.",
  pais_invalido: "Elegí el país del número.",
  demasiados_codigos: "Ya te mandamos varios códigos. Esperá unos minutos y revisá tu correo.",
  correo_no_enviado: "No pudimos mandarte el código. Probá de nuevo en unos minutos.",
  codigo_vencido: "Ese código ya venció. Pedí uno nuevo.",
  codigo_incorrecto: "El código no coincide. Revisalo y probá de nuevo.",
  ficha_no_disponible: "No pudimos traer el detalle ahora. Abrí el acta en el INPI o probá en unos minutos.",
  demasiadas_fichas: "Abriste muchas fichas seguidas. Esperá unos minutos y probá de nuevo.",
  acta_invalida: "Ese número de acta no existe.",
};

/** The page's own words for what the app answered; the app's sentence when the code is new. */
export function textoDeFalla(f: Falla): string {
  return TEXTO_DE_FALLA[f.codigo] ?? f.mensaje;
}

/** A text the INPI wrote all in capitals, as a sentence: "GALLETAS RELLENAS" → "Galletas rellenas". */
export function oracion(texto: string): string {
  const s = texto.trim();
  if (!s || /\p{Ll}/u.test(s)) return s;
  const minus = s.toLocaleLowerCase("es");
  return minus[0]!.toLocaleUpperCase("es") + minus.slice(1);
}
