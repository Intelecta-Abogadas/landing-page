/**
 * Whether the page is open in a private window, where clearing the window would start the count
 * over: there the app asks for the details from the first search. Each browser gives itself
 * away differently; when none of the signs answers, the window counts as a normal one.
 *
 * - Chrome, Edge, Opera: a private window gets a storage quota far below a normal one's.
 * - Firefox: a private window has no service workers.
 * - Safari: a private window refuses the origin's private file system.
 */
type Senales = {
  cuota: () => Promise<number | null>;
  limiteDeMemoria: number | null;
  conServiceWorker: boolean;
  sistemaDeArchivos: (() => Promise<unknown>) | null;
  marca: "chromium" | "firefox" | "safari" | "otro";
};

const GIB = 1024 * 1024 * 1024;

function marcaDe(agente: string): Senales["marca"] {
  if (/firefox|fxios/i.test(agente)) return "firefox";
  if (/chrome|chromium|crios|edg|opr/i.test(agente)) return "chromium";
  if (/safari/i.test(agente)) return "safari";
  return "otro";
}

export async function esPrivadoCon(s: Senales): Promise<boolean> {
  try {
    if (s.marca === "firefox") return !s.conServiceWorker;
    if (s.marca === "chromium") {
      const cuota = await s.cuota();
      if (cuota === null) return false;
      return cuota < 2 * (s.limiteDeMemoria ?? GIB);
    }
    if (s.marca === "safari" && s.sistemaDeArchivos) {
      try {
        await s.sistemaDeArchivos();
        return false;
      } catch (e) {
        return String((e as Error)?.message ?? "").includes("unknown transient reason");
      }
    }
  } catch {
    return false;
  }
  return false;
}

export function esPrivado(): Promise<boolean> {
  if (typeof navigator === "undefined") return Promise.resolve(false);
  const almacen = navigator.storage as (StorageManager & { getDirectory?: () => Promise<unknown> }) | undefined;
  const memoria = (performance as Performance & { memory?: { jsHeapSizeLimit?: number } }).memory;
  const senales: Senales = {
    cuota: async () => (almacen?.estimate ? ((await almacen.estimate()).quota ?? null) : null),
    limiteDeMemoria: memoria?.jsHeapSizeLimit ?? null,
    conServiceWorker: "serviceWorker" in navigator && navigator.serviceWorker !== undefined,
    sistemaDeArchivos: almacen?.getDirectory ? () => almacen.getDirectory!() : null,
    marca: marcaDe(navigator.userAgent),
  };
  const espera = new Promise<boolean>((r) => setTimeout(() => r(false), 800));
  return Promise.race([esPrivadoCon(senales), espera]);
}
