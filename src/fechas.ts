/**
 * The calendar the product runs on, in Argentina's time: the bulletin comes out on
 * Wednesday and the report leaves on Thursday at 08:00 (jobs/boot.ts in the app).
 */

const ZONA = "America/Argentina/Buenos_Aires";
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIA_MS = 86_400_000;
// Argentina has no daylight saving time: UTC-3 all year.
const DESFASE_MS = 3 * 3_600_000;

/** A calendar day in Argentina, kept as UTC midnight of that date. */
export type Dia = Date;

export function hoyArgentina(ahora = new Date()): Dia {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(ahora)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(partes[0], partes[1] - 1, partes[2]));
}

export const sumarDias = (d: Dia, n: number): Dia => new Date(d.getTime() + n * DIA_MS);
export const diasEntre = (a: Dia, b: Dia) => Math.round((b.getTime() - a.getTime()) / DIA_MS);

/** The latest Wednesday, today included. */
export function ultimoMiercoles(ahora = new Date()): Dia {
  const hoy = hoyArgentina(ahora);
  return sumarDias(hoy, -((hoy.getUTCDay() - 3 + 7) % 7));
}

/** The next Wednesday, today included. */
export function proximoMiercoles(ahora = new Date()): Dia {
  const hoy = hoyArgentina(ahora);
  return sumarDias(hoy, (3 - hoy.getUTCDay() + 7) % 7);
}

/** The next report: Thursday 08:00 in Argentina, as a real instant. */
export function proximoInforme(ahora = new Date()): Date {
  const hoy = hoyArgentina(ahora);
  let jueves = sumarDias(hoy, (4 - hoy.getUTCDay() + 7) % 7);
  let instante = new Date(jueves.getTime() + 8 * 3_600_000 + DESFASE_MS);
  if (instante.getTime() <= ahora.getTime()) {
    jueves = sumarDias(jueves, 7);
    instante = new Date(jueves.getTime() + 8 * 3_600_000 + DESFASE_MS);
  }
  return instante;
}

/** The bulletin that report belongs to: the Wednesday before it. */
export const boletinDelInforme = (informe: Date): Dia => sumarDias(hoyArgentina(informe), -1);

export const fechaLarga = (d: Dia) =>
  `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;

export const fechaSinAnio = (d: Dia) => `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;

export const horaArgentina = (d: Date) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
