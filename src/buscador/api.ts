import { URL_SISTEMA } from "../piezas";
import type { Busqueda, EstadoDelCupo, Falla, Ficha, Pais } from "./tipos";

/**
 * The search runs in the app (`/api/publico/*`), never in this page: the page only asks. The app
 * keeps a cookie of its own to count the searches, so every request carries the credentials.
 * `VITE_API_BUSCADOR` points the local server at the app running on this machine.
 */
export const API = (import.meta.env.VITE_API_BUSCADOR as string | undefined) ?? URL_SISTEMA;

/** An answer that is not the one asked for: the app's code, its sentence and the allowance as it stands. */
export class Rechazo extends Error {
  constructor(
    readonly status: number,
    readonly falla: Falla,
    readonly estado: EstadoDelCupo | null,
  ) {
    super(falla.mensaje);
  }
}

const SIN_CONEXION: Falla = { codigo: "sin_conexion", mensaje: "No pudimos conectarnos." };

export async function pedir<T>(ruta: string, cuerpo?: unknown, llamar: typeof fetch = fetch): Promise<T> {
  let res: Response;
  try {
    res = await llamar(`${API}/api/publico/${ruta}`, {
      method: cuerpo === undefined ? "GET" : "POST",
      credentials: "include",
      headers: cuerpo === undefined ? undefined : { "content-type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new Rechazo(0, SIN_CONEXION, null);
  }
  const datos = (await res.json().catch(() => null)) as (T & { error?: Falla; estado?: EstadoDelCupo }) | null;
  if (!res.ok || !datos) {
    const falla = datos?.error && typeof datos.error.codigo === "string" ? datos.error : { codigo: "error", mensaje: "No se pudo completar." };
    throw new Rechazo(res.status, falla, datos?.estado ?? null);
  }
  return datos;
}

export const estado = () => pedir<{ estado: EstadoDelCupo; paises: Pais[] }>("estado");

export const buscar = (denominacion: string, clases: number[], privado: boolean) =>
  pedir<{ busqueda: Busqueda; estado: EstadoDelCupo }>("buscar", { denominacion, clases, privado });

export const pedirCodigo = (datos: { nombre: string; correo: string; whatsapp: string; pais: string }) =>
  pedir<{ enviado: true; correo: string }>("datos", datos);

export const confirmar = (correo: string, codigo: string) => pedir<{ estado: EstadoDelCupo }>("confirmar", { correo, codigo });

export const ficha = (acta: string) => pedir<{ ficha: Ficha }>(`marcas/${encodeURIComponent(acta)}`);
