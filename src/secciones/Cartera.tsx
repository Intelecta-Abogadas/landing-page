import type { CSSProperties } from "react";
import { useVisto } from "../movimiento";
import { PildoraInpi, Seccion } from "../piezas";

type Fila = { marca: string; acta: string; clase: number; estado: "Concedida" | "En trámite"; vence: string };

const CARTERA: Array<{ cliente: string; marcas: Fila[] }> = [
  {
    cliente: "Tostadero Quimbaya",
    marcas: [
      { marca: "Quimbaya", acta: "4.512.877", clase: 30, estado: "Concedida", vence: "14/03/2034" },
      { marca: "Quimbaya Café de Origen", acta: "4.698.120", clase: 43, estado: "En trámite", vence: "-" },
    ],
  },
  {
    cliente: "Hilvana Textil",
    marcas: [
      { marca: "Hilvana", acta: "4.233.560", clase: 25, estado: "Concedida", vence: "02/08/2031" },
      { marca: "Hilvana", acta: "4.233.561", clase: 26, estado: "Concedida", vence: "02/08/2031" },
    ],
  },
  {
    cliente: "Agencia Brújula",
    marcas: [{ marca: "Brújula", acta: "4.401.992", clase: 39, estado: "Concedida", vence: "19/11/2032" }],
  },
];

const PUNTOS: Array<[string, string]> = [
  [
    "Se carga con números de acta.",
    "Pegados en un cuadro o en una planilla de Excel o CSV. El resto lo trae el sistema: denominación, clase, tipo, titular e imagen.",
  ],
  ["Cada marca, con su cliente.", "Las alertas llegan agrupadas por cliente, y cada cliente tiene su correo de avisos."],
  ["Cada acta abre su expediente.", "Un clic y estás en la consulta del INPI, sin copiar números."],
  ["El estudio entero adentro.", "Un responsable y los miembros que invite, cada uno con su usuario."],
];

export function Cartera() {
  const [tabla, vista, anima] = useVisto<HTMLDivElement>();
  let orden = 0;
  return (
    <Seccion id="cartera" className="cartera">
      <div className="cartera-grilla">
        <div className="cartera-texto">
          <h2>Tu cartera, ordenada por cliente.</h2>
          <dl className="puntos">
            {PUNTOS.map(([titulo, texto]) => (
              <div key={titulo}>
                <dt>{titulo}</dt>
                <dd>{texto}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          ref={tabla}
          className={["tabla-cartera", anima ? "anima" : "", vista ? "visto" : ""].join(" ")}
          role="table"
          aria-label="Una cartera de ejemplo"
        >
          <div className="tc-fila tc-titulos" role="row">
            <span role="columnheader">Denominación</span>
            <span role="columnheader">Acta</span>
            <span role="columnheader">Clase</span>
            <span role="columnheader">Estado en el INPI</span>
            <span role="columnheader">Vencimiento</span>
          </div>
          {CARTERA.map((g) => (
            <div key={g.cliente} role="rowgroup" className="tc-grupo">
              <div className="tc-cliente" role="row" style={{ "--i": orden++ } as CSSProperties}>
                <span role="cell">{g.cliente}</span>
              </div>
              {g.marcas.map((m) => (
                <div key={m.acta} className="tc-fila" role="row" style={{ "--i": orden++ } as CSSProperties}>
                  <span role="cell" className="tc-marca">
                    {m.marca}
                    <span className="tc-movil mono" aria-hidden="true">
                      {m.acta} · Clase {m.clase}
                    </span>
                  </span>
                  <span role="cell" className="mono tc-acta">
                    {m.acta}
                  </span>
                  <span role="cell" className="mono">
                    {m.clase}
                  </span>
                  <span role="cell">
                    <PildoraInpi color={m.estado === "Concedida" ? "verde" : "ambar"}>{m.estado}</PildoraInpi>
                  </span>
                  <span role="cell" className="mono">
                    {m.vence}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Seccion>
  );
}
