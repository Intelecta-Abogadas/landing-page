import { describe, expect, it } from "vitest";
import { API, pedir, Rechazo } from "./api";
import { esPrivadoCon } from "./privado";
import {
  actaConPuntos,
  conY,
  diaArgentino,
  estadoVisible,
  fechaDeDia,
  nombreVisible,
  oracion,
  textoDeClases,
  textoDeFalla,
  textoDelCupo,
} from "./textos";
import type { EstadoDelCupo } from "./tipos";

const sinDatos = (restantes: number): EstadoDelCupo => ({
  conDatos: false,
  nombre: null,
  cupo: 3,
  usadas: 3 - restantes,
  restantes,
  vence: null,
  vuelveEn: null,
  vencido: false,
});

const conDatos = (restantes: number, vencido = false): EstadoDelCupo => ({
  conDatos: true,
  nombre: "LAURA PEREZ",
  cupo: 5,
  usadas: 5 - restantes,
  restantes,
  vence: "2027-01-19T15:00:00.000Z",
  vuelveEn: restantes === 0 ? "2026-10-20T03:00:00.000Z" : null,
  vencido,
});

describe("what the page writes", () => {
  it("shows the INPI's capitals as names, keeping company types", () => {
    expect(nombreVisible("TOSTADERO QUIMBAYA SRL")).toBe("Tostadero Quimbaya SRL");
    expect(nombreVisible("CASA DE LA PAZ")).toBe("Casa de la Paz");
    expect(nombreVisible("Kaza")).toBe("Kaza");
    expect(oracion("ZAPATAS DE FRENO PARA VEHÍCULOS")).toBe("Zapatas de freno para vehículos");
    expect(oracion("relleno color rosado")).toBe("relleno color rosado");
  });

  it("names the classes searched", () => {
    expect(textoDeClases([])).toBe("Todas las clases");
    expect(textoDeClases([30])).toBe("Clase 30");
    expect(textoDeClases([9, 35, 42])).toBe("Clases 9, 35 y 42");
    expect(textoDeClases([1, 2, 3, 4, 5])).toBe("5 clases");
    expect(conY(["Kaza", "Caza", "Kasa"])).toBe("Kaza, Caza y Kasa");
  });

  it("writes acts, days and statuses as the app does", () => {
    expect(actaConPuntos("4778990")).toBe("4.778.990");
    expect(fechaDeDia("2026-09-16")).toBe("16/09/2026");
    expect(fechaDeDia(null)).toBe("-");
    expect(diaArgentino("2026-10-20T02:30:00.000Z")).toBe("19/10/2026");
    expect(estadoVisible("CONCEDIDA", "CONCEDIDA")).toEqual({ t: "Concedida", color: "verde" });
    expect(estadoVisible(null, "EN OPOSICION")).toEqual({ t: "En oposicion", color: "gris" });
  });

  it("tells the allowance left", () => {
    expect(textoDelCupo(sinDatos(2))).toBe("Te quedan 2 de 3 búsquedas sin dejar tus datos.");
    expect(textoDelCupo(sinDatos(1))).toBe("Te queda 1 de 3 búsquedas sin dejar tus datos.");
    expect(textoDelCupo(sinDatos(0))).toBe("Usaste las 3 búsquedas sin dejar tus datos.");
    expect(textoDelCupo(conDatos(4))).toBe("Laura, te quedan 4 de 5 búsquedas de hoy. Podés buscar hasta el 19/01/2027.");
    expect(textoDelCupo(conDatos(0))).toBe("Laura, ya hiciste las 5 búsquedas de hoy. Mañana tenés 5 más. Podés buscar hasta el 19/01/2027.");
    expect(textoDelCupo(conDatos(0, true))).toBe("Laura, terminó tu plazo de búsquedas.");
  });

  it("puts the app's answers in its own words, and keeps the app's sentence for a new code", () => {
    expect(textoDeFalla({ codigo: "inpi_no_responde", mensaje: "x" })).toContain("esta búsqueda no se descuenta");
    expect(textoDeFalla({ codigo: "nuevo", mensaje: "Algo nuevo." })).toBe("Algo nuevo.");
  });
});

describe("asking the app", () => {
  const responde = (status: number, cuerpo: unknown) => (async () => new Response(JSON.stringify(cuerpo), { status })) as typeof fetch;

  it("goes to the app with the credentials, so the app can count", async () => {
    let pedido: { url: string; init?: RequestInit } | null = null;
    const llamar = (async (url: string, init?: RequestInit) => {
      pedido = { url, init };
      return new Response(JSON.stringify({ ok: 1 }), { status: 200 });
    }) as unknown as typeof fetch;
    await pedir("buscar", { denominacion: "Kaza" }, llamar);
    expect(pedido!.url).toBe(`${API}/api/publico/buscar`);
    expect(pedido!.init).toMatchObject({ method: "POST", credentials: "include" });
  });

  it("turns a refusal into its code, its sentence and the allowance", async () => {
    const cuerpo = { error: { codigo: "datos_requeridos", mensaje: "Dejá tus datos.", motivo: "sin_datos" }, estado: sinDatos(0) };
    const e = await pedir("buscar", {}, responde(403, cuerpo)).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(Rechazo);
    expect((e as Rechazo).falla.motivo).toBe("sin_datos");
    expect((e as Rechazo).estado?.restantes).toBe(0);
  });

  it("says so when there is no connection", async () => {
    const caida = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const e = (await pedir("estado", undefined, caida).catch((x: unknown) => x)) as Rechazo;
    expect(e.falla.codigo).toBe("sin_conexion");
  });
});

describe("a private window", () => {
  const base = { cuota: async () => 50_000_000_000, limiteDeMemoria: 4_294_705_152, conServiceWorker: true, sistemaDeArchivos: null };

  it("is told by its storage quota in Chrome", async () => {
    expect(await esPrivadoCon({ ...base, marca: "chromium" })).toBe(false);
    expect(await esPrivadoCon({ ...base, marca: "chromium", cuota: async () => 1_200_000_000 })).toBe(true);
  });

  it("is told by the missing service workers in Firefox", async () => {
    expect(await esPrivadoCon({ ...base, marca: "firefox", conServiceWorker: false })).toBe(true);
    expect(await esPrivadoCon({ ...base, marca: "firefox" })).toBe(false);
  });

  it("is told by the refused file system in Safari, and counts as normal when nothing answers", async () => {
    const negado = async () => {
      throw new Error("unknown transient reason");
    };
    expect(await esPrivadoCon({ ...base, marca: "safari", sistemaDeArchivos: negado })).toBe(true);
    expect(await esPrivadoCon({ ...base, marca: "safari", sistemaDeArchivos: async () => ({}) })).toBe(false);
    expect(await esPrivadoCon({ ...base, marca: "otro" })).toBe(false);
  });
});
