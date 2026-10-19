import { useState, type CSSProperties } from "react";
import { COINCIDENCIAS, conY, estadoVisible, fechaDeDia, nombreVisible, textoDeClases, TIPO_MARCA, actaConPuntos } from "./textos";
import type { Busqueda, Registro } from "./tipos";

/** TMview's image of the mark; when it does not load the cell keeps its place, empty. */
export function Logo({ src, nombre, grande = false }: { src: string | null; nombre: string; grande?: boolean }) {
  const [fallo, setFallo] = useState(false);
  const clase = grande ? "logo logo-grande" : "logo";
  if (!src || fallo) return <span className={`${clase} logo-sin`} aria-hidden="true" />;
  return (
    <span className={clase}>
      <img src={src} alt={`Logo de ${nombre}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallo(true)} />
    </span>
  );
}

export function EstadoInpi({ registro }: { registro: Pick<Registro, "estado" | "estadoInpi"> }) {
  const e = estadoVisible(registro.estado, registro.estadoInpi);
  return (
    <span className={`pildora estado inpi-${e.color}`}>
      <i aria-hidden="true" />
      {e.t}
    </span>
  );
}

/**
 * The live marks the INPI returned, grouped from the closest, one row per act: a name filed in
 * three classes is three rows. Every row opens its sheet.
 */
export function Resultados({ busqueda, clases, onAbrir }: { busqueda: Busqueda; clases: number[]; onAbrir: (r: Registro, nombre: string) => void }) {
  const nombre = nombreVisible(busqueda.denominacion);
  const grafias = busqueda.grafias.map(nombreVisible);
  const otras = grafias.filter((g) => g !== nombre);
  const actas = busqueda.resultados.reduce((n, r) => n + r.registros.length, 0);
  let fila = 0;

  return (
    <div className="resultados">
      <div className="resultados-cabeza">
        <h2 className="resultados-titulo" tabIndex={-1} data-foco>
          {busqueda.total === 0
            ? `No hay marcas vigentes parecidas a ${nombre}.`
            : actas === 1
              ? `Una marca vigente parecida a ${nombre}.`
              : `${actas.toLocaleString("es-AR")} marcas vigentes parecidas a ${nombre}.`}
        </h2>
        <p className="resultados-alcance">
          {textoDeClases(clases)}, en trámite o concedidas.
          {otras.length ? ` Consultamos el INPI también con ${conY(otras)}, que suenan igual.` : ""}
        </p>
      </div>

      {busqueda.total > 0 ? (
        <div className="tabla-buscador">
          <table>
            <thead>
              <tr>
                <th scope="col">Marca</th>
                <th scope="col">Clase</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">Titular</th>
                <th scope="col">Presentada</th>
                <th scope="col">Acta</th>
              </tr>
            </thead>
            {COINCIDENCIAS.map((g) => {
              const delGrupo = busqueda.resultados.filter((r) => r.coincidencia === g.v);
              if (delGrupo.length === 0) return null;
              const cuantas = delGrupo.reduce((n, r) => n + r.registros.length, 0);
              return (
                <tbody key={g.v}>
                  <tr className="grupo">
                    <th scope="colgroup" colSpan={7}>
                      <span className="grupo-nombre">
                        {g.t} <span className="cifra">{cuantas}</span>
                      </span>
                      <span className="grupo-ayuda">{g.ayuda}</span>
                    </th>
                  </tr>
                  {delGrupo.flatMap((r) =>
                    r.registros.map((reg) => {
                      const visible = nombreVisible(r.denominacion);
                      const i = fila++;
                      return (
                        <tr key={reg.acta} className="marca-fila" style={{ "--i": Math.min(i, 14) } as CSSProperties} onClick={() => onAbrir(reg, visible)}>
                          <td>
                            <div className="marca-celda">
                              <Logo src={reg.logo} nombre={visible} />
                              <button type="button" className="fila-nombre" onClick={(e) => (e.stopPropagation(), onAbrir(reg, visible))}>
                                {visible}
                              </button>
                              <span className="marca-movil">
                                Clase {reg.clase ?? "-"} · {reg.titulares.map(nombreVisible).join(", ") || "Sin titular"}
                              </span>
                            </div>
                          </td>
                          <td className="cifra">{reg.clase ?? "-"}</td>
                          <td>{TIPO_MARCA[reg.tipo] ?? "Sin dato"}</td>
                          <td>
                            <EstadoInpi registro={reg} />
                          </td>
                          <td>{reg.titulares.map(nombreVisible).join(", ") || "-"}</td>
                          <td className="cifra">{fechaDeDia(reg.presentada)}</td>
                          <td className="mono">{actaConPuntos(reg.acta)}</td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              );
            })}
          </table>
        </div>
      ) : null}
    </div>
  );
}
