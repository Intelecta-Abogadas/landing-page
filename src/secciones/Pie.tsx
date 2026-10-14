import { Isotipo } from "../Isotipo";
import { enlaceInterno, LEGALES, URL_FORMULARIO, URL_SISTEMA, type Legal } from "../piezas";

/** `inicio` is the way back to the landing; `actual` marks the legal page being read. */
export function Pie({ inicio = "", actual }: { inicio?: string; actual?: Legal }) {
  return (
    <footer className="pie">
      <div className="marco pie-fila">
        <div className="pie-marca">
          <Isotipo className="pie-iso" />
          <div>
            <p className="pie-nombre">Monitor de Marcas</p>
            <p className="suave">Vigilancia de marcas sobre el Boletín de Marcas del INPI.</p>
          </div>
        </div>
        <nav className="pie-enlaces" aria-label="Pie">
          <a href={enlaceInterno(`${inicio}#embudo`)}>Cómo trabaja</a>
          <a href={enlaceInterno(`${inicio}#cotejo`)}>El cotejo</a>
          <a href={enlaceInterno(`${inicio}#alerta`)}>Las alertas</a>
          <a href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
            Solicitar demo
          </a>
          <a href={URL_SISTEMA}>Ingresar</a>
        </nav>
      </div>
      <nav className="pie-legales" aria-label="Legales">
        {(Object.keys(LEGALES) as Legal[]).map((clave) => (
          <a
            key={clave}
            href={enlaceInterno(inicio + LEGALES[clave].ruta)}
            aria-current={clave === actual ? "page" : undefined}
          >
            {LEGALES[clave].nombre}
          </a>
        ))}
      </nav>
    </footer>
  );
}
