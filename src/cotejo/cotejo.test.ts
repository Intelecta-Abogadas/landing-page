import { describe, expect, it } from "vitest";
import casos from "./casos.json";
import { claveCastellana, metaphoneCastellano, metaphoneIngles } from "./fonetica";
import { cotejar, UMBRAL } from "./index";

describe("el filtro del navegador contesta lo mismo que el backend", () => {
  it.each(casos.claves)("las claves de $palabra", (c) => {
    expect(claveCastellana(c.palabra)).toBe(c.castellano);
    expect(metaphoneCastellano(c.palabra)).toBe(c.metaphone);
    expect(metaphoneIngles(c.palabra)).toBe(c.ingles);
  });

  it.each(casos.pares)("$a frente a $b", (c) => {
    const r = cotejar(c.a, c.b);
    expect(r.literal).toBeCloseTo(c.literal, 6);
    expect(r.castellano).toBeCloseTo(c.castellano, 6);
    expect(r.ingles).toBeCloseTo(c.ingles, 6);
    expect(r.contencion).toBeCloseTo(c.contencion, 6);
    expect(r.parecido).toBeCloseTo(c.parecido, 6);
    expect(r.parecido >= UMBRAL).toBe(c.parecido >= UMBRAL);
  });
});
