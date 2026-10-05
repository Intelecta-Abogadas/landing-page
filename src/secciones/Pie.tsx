import { Isotipo } from "../Isotipo";
import { URL_FORMULARIO, URL_SISTEMA } from "../piezas";

export function Pie() {
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
          <a href="#embudo">Cómo trabaja</a>
          <a href="#cotejo">El cotejo</a>
          <a href="#alerta">Las alertas</a>
          <a href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
            Solicitar demo
          </a>
          <a href={URL_SISTEMA}>Ingresar</a>
        </nav>
      </div>
    </footer>
  );
}
