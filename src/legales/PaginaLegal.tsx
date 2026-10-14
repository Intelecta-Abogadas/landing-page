import { useEffect, useState } from "react";
import type { Legal } from "../piezas";
import { Cabecera } from "../secciones/Cabecera";
import { Pie } from "../secciones/Pie";
import { DOCUMENTOS, tramos, type Bloque, type Parte } from "./documentos";

const INICIO = "../";
const LINEA_DE_LECTURA = 120;
const idClausula = (numero: number) => `clausula-${numero}`;

function Texto({ partes }: { partes: Parte[] }) {
  return partes.map((parte, i) => {
    const contenido = tramos(parte.texto).map((tramo, j) =>
      tramo.href ? (
        <a key={j} className="legal-enlace" href={tramo.href}>
          {tramo.texto}
        </a>
      ) : (
        tramo.texto
      ),
    );
    return parte.negrita ? <strong key={i}>{contenido}</strong> : <span key={i}>{contenido}</span>;
  });
}

function Bloques({ bloques }: { bloques: Bloque[] }) {
  return bloques.map((bloque, i) => {
    if (bloque.tipo === "parrafo") {
      return (
        <p key={i}>
          <Texto partes={bloque.partes} />
        </p>
      );
    }
    const Lista = bloque.numerada ? "ol" : "ul";
    return (
      <Lista key={i} className="legal-lista">
        {bloque.items.map((item, j) => (
          <li key={j}>
            <Texto partes={item} />
          </li>
        ))}
      </Lista>
    );
  });
}

/**
 * The clause being read: the one that crosses a one-pixel line just under the header. Clauses sit
 * one after another, so only one can cross it at a time.
 */
function useClausulaActual(numeros: number[]) {
  const [actual, setActual] = useState(numeros[0]);
  useEffect(() => {
    let observador: IntersectionObserver | undefined;
    const observar = () => {
      observador?.disconnect();
      const debajo = Math.max(0, window.innerHeight - LINEA_DE_LECTURA - 1);
      observador = new IntersectionObserver(
        (entradas) => {
          const cruza = entradas.find((entrada) => entrada.isIntersecting);
          if (cruza) setActual(Number((cruza.target as HTMLElement).dataset.clausula));
        },
        { rootMargin: `-${LINEA_DE_LECTURA}px 0px -${debajo}px 0px` },
      );
      for (const numero of numeros) {
        const seccion = document.getElementById(idClausula(numero));
        if (seccion) observador.observe(seccion);
      }
    };
    observar();
    window.addEventListener("resize", observar);
    return () => {
      observador?.disconnect();
      window.removeEventListener("resize", observar);
    };
  }, [numeros]);
  return actual;
}

export function PaginaLegal({ clave }: { clave: Legal }) {
  const documento = DOCUMENTOS[clave];
  const [numeros] = useState(() => documento.clausulas.map((clausula) => clausula.numero));
  const actual = useClausulaActual(numeros);
  const [indiceAbierto, setIndiceAbierto] = useState(false);

  return (
    <>
      <Cabecera inicio={INICIO} />
      <main className="legal">
        <div className="marco legal-rejilla">
          <header className="legal-cabeza">
            <h1>{documento.titulo}</h1>
            <div className="legal-datos">
              <Bloques bloques={documento.inicio} />
            </div>
          </header>

          <nav className={indiceAbierto ? "legal-indice abierto" : "legal-indice"} aria-label="Cláusulas">
            <button
              type="button"
              className="btn btn-borde btn-chico legal-indice-boton"
              aria-expanded={indiceAbierto}
              aria-controls="legal-indice-lista"
              onClick={() => setIndiceAbierto((abierto) => !abierto)}
            >
              {indiceAbierto ? "Ocultar las cláusulas" : "Ver las cláusulas"}
            </button>
            <p className="legal-indice-rotulo" aria-hidden="true">
              Cláusulas
            </p>
            <ol id="legal-indice-lista" className="legal-indice-lista">
              {documento.clausulas.map((clausula) => (
                <li key={clausula.numero}>
                  <a
                    href={`#${idClausula(clausula.numero)}`}
                    aria-current={clausula.numero === actual ? "location" : undefined}
                    onClick={() => setIndiceAbierto(false)}
                  >
                    {clausula.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-texto">
            {documento.clausulas.map((clausula) => (
              <section
                key={clausula.numero}
                id={idClausula(clausula.numero)}
                data-clausula={clausula.numero}
                className="legal-clausula"
                aria-labelledby={`${idClausula(clausula.numero)}-titulo`}
              >
                <h2 id={`${idClausula(clausula.numero)}-titulo`}>{clausula.titulo}</h2>
                <Bloques bloques={clausula.bloques} />
              </section>
            ))}
          </article>
        </div>
      </main>
      <Pie inicio={INICIO} actual={clave} />
    </>
  );
}
