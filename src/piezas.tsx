import type { ReactNode } from "react";

export const URL_SISTEMA = "https://app.monitordemarcas.com.ar";
export const URL_FORMULARIO = "https://forms.gle/rbHraM9f5jZR2uQB8";

export type Legal = "terminos" | "privacidad";

export const LEGALES: Record<Legal, { ruta: string; nombre: string }> = {
  terminos: { ruta: "terminos/", nombre: "Términos y condiciones" },
  privacidad: { ruta: "privacidad/", nombre: "Política de privacidad" },
};

const DESDE_ARCHIVO = typeof location !== "undefined" && location.protocol === "file:";

/**
 * Each page lives in its own folder ("terminos/", "../"). A built page opened from disk has no
 * server to resolve a folder to its index.html, so there the link names the file.
 */
export function enlaceInterno(ruta: string, desdeArchivo = DESDE_ARCHIVO) {
  if (!desdeArchivo) return ruta;
  const [camino, ancla] = ruta.split("#");
  const archivo = camino.endsWith("/") ? `${camino}index.html` : camino;
  return ancla === undefined ? archivo : `${archivo}#${ancla}`;
}

export type Nivel = "identica" | "critica" | "alta" | "revisar";
export type Estado = "sin" | "analisis" | "oponer" | "opuesta" | "descartada";

export const NIVEL: Record<Nivel, string> = {
  identica: "Idéntica",
  critica: "Crítica",
  alta: "Alta",
  revisar: "A revisar",
};

export const ESTADO: Record<Estado, string> = {
  sin: "Sin revisar",
  analisis: "En análisis",
  oponer: "A oponer",
  opuesta: "Opuesta",
  descartada: "Descartada",
};

export function PildoraNivel({ nivel }: { nivel: Nivel }) {
  return <span className={`pildora nivel-${nivel}`}>{NIVEL[nivel]}</span>;
}

export function PildoraEstado({ estado }: { estado: Estado }) {
  return (
    <span className={`pildora estado estado-${estado}`}>
      <i aria-hidden="true" />
      {ESTADO[estado]}
    </span>
  );
}

export function PildoraInpi({ children, color }: { children: ReactNode; color: "verde" | "ambar" }) {
  return (
    <span className={`pildora estado inpi-${color}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

/** 0.6213 → "0,62": the way the app and the studios write a decimal. */
export const decimal = (n: number) => n.toFixed(2).replace(".", ",");

export function Seccion({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={["seccion", className].filter(Boolean).join(" ")}>
      <div className="marco">{children}</div>
    </section>
  );
}
