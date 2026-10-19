import { useEffect, useRef, useState } from "react";
import { ficha as pedirFicha, Rechazo } from "./api";
import { EstadoInpi, Logo } from "./Resultados";
import { actaConPuntos, fechaDeDia, nombreVisible, oracion, textoDeFalla, TIPO_MARCA, urlActaInpi } from "./textos";
import type { Ficha, Registro } from "./tipos";

type Carga = { acta: string; ficha: Ficha | null; error: string | null };

const guardadas = new Map<string, Ficha>();

/**
 * A mark's sheet, at the right of the page: what the row already showed plus what only TMview
 * carries (the whole list of products, the owners, what the logo shows and the opposition
 * period). It is asked once per act and kept while the page is open.
 */
export function FichaMarca({ registro, nombre, onCerrar }: { registro: Registro | null; nombre: string; onCerrar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [carga, setCarga] = useState<Carga | null>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (registro && !d.open) d.showModal();
    if (!registro && d.open) d.close();
  }, [registro]);

  useEffect(() => {
    if (!registro) return;
    const acta = registro.acta;
    const guardada = guardadas.get(acta);
    if (guardada) {
      setCarga({ acta, ficha: guardada, error: null });
      return;
    }
    setCarga({ acta, ficha: null, error: null });
    let vigente = true;
    pedirFicha(acta)
      .then(({ ficha }) => {
        guardadas.set(acta, ficha);
        if (vigente) setCarga({ acta, ficha, error: null });
      })
      .catch((e: unknown) => {
        const texto = e instanceof Rechazo ? textoDeFalla(e.falla) : "No pudimos traer el detalle ahora.";
        if (vigente) setCarga({ acta, ficha: null, error: texto });
      });
    return () => {
      vigente = false;
    };
  }, [registro]);

  const actual = registro && carga?.acta === registro.acta ? carga : null;
  const f = actual?.ficha ?? null;

  return (
    <dialog
      ref={dialogo}
      className="ficha-marca"
      aria-labelledby="ficha-marca-titulo"
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === dialogo.current) dialogo.current.close();
      }}
    >
      {registro ? (
        <div className="fm-hoja">
          <header className="fm-cabeza">
            <Logo src={f?.logo ?? registro.logo} nombre={nombre} grande />
            <div className="fm-titulos">
              <h2 id="ficha-marca-titulo">{nombre}</h2>
              <p className="fm-datos">
                <span className="mono">Acta {actaConPuntos(registro.acta)}</span>
                <span>Clase {registro.clase ?? "-"}</span>
                <span>{TIPO_MARCA[registro.tipo] ?? "Sin dato"}</span>
              </p>
              <EstadoInpi registro={registro} />
            </div>
            <button type="button" className="fm-cerrar" aria-label="Cerrar la ficha" onClick={() => dialogo.current?.close()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="fm-cuerpo">
            <section className="fm-bloque">
              <h3>Titulares</h3>
              <ul className="fm-lista">
                {(f?.titulares.length ? f.titulares : registro.titulares).map((t) => (
                  <li key={t}>{nombreVisible(t)}</li>
                ))}
              </ul>
            </section>

            <section className="fm-bloque">
              <h3>Presentada</h3>
              <p className="cifra">{fechaDeDia(registro.presentada)}</p>
            </section>

            {actual === null || (!f && !actual.error) ? (
              <div className="fm-cargando" role="status">
                <span className="barra-buscando" aria-hidden="true" />
                Trayendo los productos y el detalle de la marca.
              </div>
            ) : actual.error ? (
              <p className="fm-aviso" role="alert">
                {actual.error}
              </p>
            ) : f && !f.encontrada ? (
              <p className="fm-aviso">El detalle de esta marca todavía no está publicado. El acta en el INPI tiene lo último.</p>
            ) : f ? (
              <>
                {f.oposicionDesde || f.oposicionHasta ? (
                  <section className="fm-bloque">
                    <h3>Plazo de oposición</h3>
                    <p className="cifra">
                      Del {fechaDeDia(f.oposicionDesde)} al {fechaDeDia(f.oposicionHasta)}
                    </p>
                  </section>
                ) : null}

                {f.descripcionDelLogo || f.colores.length ? (
                  <section className="fm-bloque">
                    <h3>El logo</h3>
                    {f.descripcionDelLogo ? <p>{oracion(f.descripcionDelLogo)}</p> : null}
                    {f.colores.length ? (
                      <ul className="fm-colores" aria-label="Colores reivindicados">
                        {f.colores.map((c) => (
                          <li key={c}>
                            <i style={{ background: c }} aria-hidden="true" />
                            <span className="mono">{c}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ) : null}

                <section className="fm-bloque">
                  <h3>Productos y servicios</h3>
                  {f.productos.length === 0 ? (
                    <p className="suave">El INPI no publicó la lista de esta marca.</p>
                  ) : (
                    f.productos.map((p, i) => (
                      <div key={`${p.clase}-${i}`} className="fm-productos">
                        <p className="fm-clase">
                          Clase {p.clase ?? "-"}
                          <span className="suave">
                            {p.soloEstos ? " · Solamente estos" : ""} · {p.terminos.length.toLocaleString("es-AR")}{" "}
                            {p.terminos.length === 1 ? "término" : "términos"}
                          </span>
                        </p>
                        <ul className="fm-terminos">
                          {p.terminos.map((t, j) => (
                            <li key={j}>{oracion(t)}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </section>
              </>
            ) : null}
          </div>

          <footer className="fm-pie">
            <a className="btn btn-solido" href={urlActaInpi(registro.acta)} target="_blank" rel="noopener noreferrer">
              Ver el acta en el INPI
            </a>
            <button type="button" className="btn btn-borde" onClick={() => dialogo.current?.close()}>
              Cerrar
            </button>
          </footer>
        </div>
      ) : null}
    </dialog>
  );
}
