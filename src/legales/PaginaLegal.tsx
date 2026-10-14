import type { Legal } from "../piezas";
import { Cabecera } from "../secciones/Cabecera";
import { Pie } from "../secciones/Pie";
import { DOCUMENTOS, tramos, type Bloque, type Parte } from "./documentos";

const INICIO = "../";
const idClausula = (numero: number) => `clausula-${numero}`;

function Texto({ partes }: { partes: Parte[] }) {
  return partes.map((parte, i) => {
    const contenido = tramos(parte.texto).map((tramo, j) => {
      const clase = tramo.entero ? "legal-entero" : undefined;
      if (tramo.href) {
        return (
          <a key={j} className={clase ? `legal-enlace ${clase}` : "legal-enlace"} href={tramo.href}>
            {tramo.texto}
          </a>
        );
      }
      return clase ? (
        <span key={j} className={clase}>
          {tramo.texto}
        </span>
      ) : (
        tramo.texto
      );
    });
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

export function PaginaLegal({ clave }: { clave: Legal }) {
  const documento = DOCUMENTOS[clave];
  return (
    <>
      <Cabecera inicio={INICIO} />
      <main className="legal">
        <div className="marco">
          <header className="legal-cabeza">
            <h1>{documento.titulo}</h1>
            <div className="legal-datos">
              <Bloques bloques={documento.inicio} />
            </div>
          </header>

          <article>
            {documento.clausulas.map((clausula) => (
              <section
                key={clausula.numero}
                id={idClausula(clausula.numero)}
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
