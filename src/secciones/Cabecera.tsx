import { useEffect, useState, type CSSProperties } from "react";
import { Isotipo } from "../Isotipo";
import { BUSCADOR, enlaceInterno, URL_FORMULARIO, URL_SISTEMA, type Pagina } from "../piezas";

const ENLACES = [
  ["#embudo", "Cómo trabaja"],
  ["#cotejo", "El cotejo"],
  ["#criterio", "El criterio"],
  ["#alerta", "Las alertas"],
  ["#cartera", "La cartera"],
] as const;

/** `inicio` is the way back to the landing: empty on it, "../" from a page in a folder; `actual` marks the page open. */
export function Cabecera({ inicio = "", actual }: { inicio?: string; actual?: Pagina }) {
  const [avance, setAvance] = useState(0);
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const largo = document.documentElement.scrollHeight - window.innerHeight;
      setAvance(largo > 0 ? window.scrollY / largo : 0);
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

  return (
    <header className={avance > 0.002 ? "cabecera con-borde" : "cabecera"}>
      <div className="marco cabecera-fila">
        <a
          className="marca"
          href={enlaceInterno(inicio || "#arriba")}
          aria-label={inicio ? "Monitor de Marcas, ir al inicio" : "Monitor de Marcas, volver arriba"}
        >
          <Isotipo className="marca-iso" />
          <span className="marca-nombre">Monitor de Marcas</span>
        </a>
        <nav className="menu" aria-label="Secciones">
          <a href={enlaceInterno(inicio + BUSCADOR.ruta)} aria-current={actual === "buscar" ? "page" : undefined}>
            {BUSCADOR.nombre}
          </a>
          {ENLACES.map(([href, texto]) => (
            <a key={href} href={enlaceInterno(inicio + href)}>
              {texto}
            </a>
          ))}
        </nav>
        <div className="cabecera-acciones">
          <a className="btn btn-borde btn-chico" href={URL_SISTEMA}>
            Ingresar
          </a>
          <a className="btn btn-solido btn-chico" href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
            Solicitar demo
          </a>
        </div>
      </div>
      <i className="cabecera-avance" style={{ "--avance": avance } as CSSProperties} aria-hidden="true" />
    </header>
  );
}
