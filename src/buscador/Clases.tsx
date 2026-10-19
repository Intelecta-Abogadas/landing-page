import { useEffect, useId, useRef, useState } from "react";
import { textoDeClases } from "./textos";

const PRODUCTOS = Array.from({ length: 34 }, (_, i) => i + 1);
const SERVICIOS = Array.from({ length: 11 }, (_, i) => i + 35);

/**
 * The Nice classes to search in: all of them unless some are chosen. The panel opens under the
 * search line and closes with «Listo», with Escape or by clicking outside it.
 */
export function Clases({ valor, onCambio, disabled }: { valor: number[]; onCambio: (v: number[]) => void; disabled?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const afuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", afuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", afuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const elegida = new Set(valor);
  const cambiar = (n: number) => onCambio(elegida.has(n) ? valor.filter((c) => c !== n) : [...valor, n].sort((a, b) => a - b));

  const grupo = (titulo: string, clases: number[]) => (
    <div className="clases-grupo" role="group" aria-label={titulo}>
      <p className="clases-titulo">{titulo}</p>
      <div className="clases-grilla">
        {clases.map((n) => (
          <button key={n} type="button" className="clase" aria-pressed={elegida.has(n)} onClick={() => cambiar(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="clases" ref={caja}>
      <div className="campo-texto clases-campo">
        <span id={`${id}-rotulo`}>Clases</span>
        <button
          ref={boton}
          type="button"
          className="clases-boton"
          aria-labelledby={`${id}-rotulo ${id}-valor`}
          aria-expanded={abierto}
          aria-controls={id}
          disabled={disabled}
          onClick={() => setAbierto((a) => !a)}
        >
          <span id={`${id}-valor`}>{textoDeClases(valor)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {abierto ? (
        <div id={id} className="clases-panel">
          {grupo("Productos", PRODUCTOS)}
          {grupo("Servicios", SERVICIOS)}
          <div className="clases-pie">
            <button type="button" className="btn btn-borde btn-chico" disabled={valor.length === 0} onClick={() => onCambio([])}>
              Todas las clases
            </button>
            <button
              type="button"
              className="btn btn-solido btn-chico"
              onClick={() => {
                setAbierto(false);
                boton.current?.focus();
              }}
            >
              Listo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
