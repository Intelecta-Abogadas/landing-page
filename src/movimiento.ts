import { useEffect, useRef, useState, type RefObject } from "react";

export const quieto = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
/** The part of [desde, hasta] already covered by p, from 0 to 1. */
export const tramo = (p: number, desde: number, hasta: number) => limitar((p - desde) / (hasta - desde));
export const salida = (t: number) => 1 - Math.pow(1 - t, 3);
export const entradaSalida = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** A deterministic random sequence, so every visitor sees the same field. */
export function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Whether the element has been seen. The element is visible by default: only a browser that
 * can watch the scroll, and a visitor who did not ask for less motion, gets the entrance.
 */
export function useVisto<T extends Element>(margen = "0px 0px -12% 0px"): [RefObject<T | null>, boolean, boolean] {
  const ref = useRef<T>(null);
  const [anima] = useState(() => typeof window !== "undefined" && "IntersectionObserver" in window && !quieto());
  const [visto, setVisto] = useState(!anima);
  useEffect(() => {
    if (!anima || !ref.current) return;
    const o = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisto(true);
          o.disconnect();
        }
      },
      { rootMargin: margen },
    );
    o.observe(ref.current);
    return () => o.disconnect();
  }, [anima, margen]);
  return [ref, visto, anima];
}

/** Whether the element is on screen now: loops stop when it is not. */
export function useEnPantalla<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [en, setEn] = useState(true);
  useEffect(() => {
    if (!ref.current || !("IntersectionObserver" in window)) return;
    const o = new IntersectionObserver((e) => setEn(e.some((x) => x.isIntersecting)));
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, en];
}

/** How far the page has scrolled through a tall section, from 0 to 1. */
export function useRecorrido<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const largo = r.height - window.innerHeight;
      setP(largo > 0 ? limitar(-r.top / largo) : 0);
    };
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);
  return [ref, p];
}

/** A number that travels to its new value instead of jumping. */
export function useNumero(destino: number, ms = 520): number {
  const [valor, setValor] = useState(destino);
  const desde = useRef(destino);
  useEffect(() => {
    if (quieto()) {
      setValor(destino);
      desde.current = destino;
      return;
    }
    const inicio = performance.now();
    const origen = desde.current;
    let cuadro = requestAnimationFrame(function paso(ahora) {
      const t = limitar((ahora - inicio) / ms);
      const v = mezclar(origen, destino, salida(t));
      desde.current = v;
      setValor(v);
      if (t < 1) cuadro = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [destino, ms]);
  return valor;
}

const LETRAS = "abcdefghijklmnopqrstuvwxyz";

/** Text that deciphers itself letter by letter when it changes. */
export function useDescifra(texto: string, ms = 460): string {
  const [ver, setVer] = useState(texto);
  useEffect(() => {
    if (quieto()) {
      setVer(texto);
      return;
    }
    const inicio = performance.now();
    let cuadro = requestAnimationFrame(function paso(ahora) {
      const t = limitar((ahora - inicio) / ms);
      const fijas = Math.floor(t * texto.length);
      setVer(
        texto
          .split("")
          .map((c, i) => (i < fijas || c === " " ? c : LETRAS[Math.floor(Math.random() * LETRAS.length)]))
          .join(""),
      );
      if (t < 1) cuadro = requestAnimationFrame(paso);
      else setVer(texto);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [texto, ms]);
  return ver;
}
