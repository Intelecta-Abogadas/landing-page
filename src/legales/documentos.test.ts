import { describe, expect, it } from "vitest";
import { enlaceInterno } from "../piezas";
import { DOCUMENTOS, tramos, type Bloque, type Parte } from "./documentos";

const partesDe = (bloques: Bloque[]): Parte[] =>
  bloques.flatMap((bloque) => (bloque.tipo === "parrafo" ? bloque.partes : bloque.items.flat()));

const todasLasPartes = Object.values(DOCUMENTOS).flatMap((documento) => [
  ...partesDe(documento.inicio),
  ...documento.clausulas.flatMap((clausula) => partesDe(clausula.bloques)),
]);

describe("el texto del estudio", () => {
  it("trae los dos documentos con sus cláusulas en orden", () => {
    expect(DOCUMENTOS.terminos.titulo).toBe("TÉRMINOS Y CONDICIONES DE USO Y CONTRATACIÓN");
    expect(DOCUMENTOS.privacidad.titulo).toBe("POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES");
    for (const [documento, total] of [
      [DOCUMENTOS.terminos, 27],
      [DOCUMENTOS.privacidad, 21],
    ] as const) {
      expect(documento.clausulas.map((clausula) => clausula.numero)).toEqual(
        Array.from({ length: total }, (_, i) => i + 1),
      );
      expect(documento.clausulas.every((clausula) => clausula.titulo.startsWith(`${clausula.numero}. `))).toBe(true);
    }
  });

  it("muestra la fecha de la última actualización arriba de cada documento", () => {
    for (const documento of Object.values(DOCUMENTOS)) {
      const inicio = partesDe(documento.inicio).map((parte) => parte.texto);
      expect(inicio).toContain("Última actualización: 13 de octubre de 2026");
    }
  });

  it("escribe cada CUIT con sus guiones y no deja ninguno sin formato", () => {
    const texto = todasLasPartes.map((parte) => parte.texto).join("\n");
    expect(texto.match(/CUIT:? \d{2}-\d{8}-\d/g)).toHaveLength(6);
    expect(texto).not.toMatch(/\d{11}/);
  });

  it("no tiene partes vacías ni espacios sueltos en los bordes de un párrafo", () => {
    for (const bloque of Object.values(DOCUMENTOS).flatMap((d) => [...d.inicio, ...d.clausulas.flatMap((c) => c.bloques)])) {
      const renglones = bloque.tipo === "parrafo" ? [bloque.partes] : bloque.items;
      for (const partes of renglones) {
        expect(partes.length).toBeGreaterThan(0);
        expect(partes.every((parte) => parte.texto.length > 0)).toBe(true);
        expect(partes[0].texto).toBe(partes[0].texto.trimStart());
        expect(partes.at(-1)!.texto).toBe(partes.at(-1)!.texto.trimEnd());
      }
    }
  });
});

describe("los enlaces dentro del texto", () => {
  it("enlaza el sitio sin tomar el punto final", () => {
    expect(tramos("disponible en https://monitordemarcas.com.ar/.")).toEqual([
      { texto: "disponible en " },
      { texto: "https://monitordemarcas.com.ar/", href: "https://monitordemarcas.com.ar/" },
      { texto: "." },
    ]);
  });

  it("enlaza el correo y el teléfono", () => {
    expect(tramos("Correo electrónico: monitordemarcas@gmail.com")[1]).toEqual({
      texto: "monitordemarcas@gmail.com",
      href: "mailto:monitordemarcas@gmail.com",
    });
    expect(tramos("Numero de telefono: +54 9 11 3273-3848")[1]).toEqual({
      texto: "+54 9 11 3273-3848",
      href: "tel:+5491132733848",
    });
  });

  it("no cambia una sola letra del texto al partirlo", () => {
    for (const parte of todasLasPartes) {
      expect(tramos(parte.texto).map((tramo) => tramo.texto).join("")).toBe(parte.texto);
    }
  });

  it("no enlaza la ley ni los números de los plazos", () => {
    const enlazados = todasLasPartes.flatMap((parte) => tramos(parte.texto).filter((tramo) => tramo.href));
    expect(new Set(enlazados.map((tramo) => tramo.href))).toEqual(
      new Set(["https://monitordemarcas.com.ar/", "mailto:monitordemarcas@gmail.com", "tel:+5491132733848"]),
    );
  });
});

describe("los enlaces entre páginas", () => {
  it("publicados apuntan a la carpeta", () => {
    expect(enlaceInterno("terminos/", false)).toBe("terminos/");
    expect(enlaceInterno("../#cotejo", false)).toBe("../#cotejo");
  });

  it("abiertos desde el disco nombran el archivo", () => {
    expect(enlaceInterno("terminos/", true)).toBe("terminos/index.html");
    expect(enlaceInterno("../", true)).toBe("../index.html");
    expect(enlaceInterno("../#cotejo", true)).toBe("../index.html#cotejo");
    expect(enlaceInterno("#embudo", true)).toBe("#embudo");
  });
});
