import { useMemo, useState, type CSSProperties } from "react";
import {
  boletinDelInforme,
  diasEntre,
  fechaLarga,
  fechaSinAnio,
  horaArgentina,
  hoyArgentina,
  proximoInforme,
  sumarDias,
} from "../fechas";
import { useVisto } from "../movimiento";
import { PildoraEstado, PildoraInpi, PildoraNivel, Seccion, type Estado } from "../piezas";

type Hecho = { cuando: string; quien: string; que: string };

const FILAS: Array<[string, string, string]> = [
  ["Denominación", "Quimbaya", "Kimballa"],
  ["Acta", "4.512.877", "4.812.301"],
  ["Clase", "30", "30"],
  ["Tipo", "Mixta", "Denominativa"],
  ["Titular", "Tostadero Quimbaya S.R.L.", "Ramiro Ezcurra"],
  ["Cliente", "Tostadero Quimbaya", "-"],
];

const ACCIONES: Array<[Estado, string, string]> = [
  ["descartada", "Descartar", "La descartaste."],
  ["oponer", "Marcar para oponer", "La marcaste para oponer."],
  ["opuesta", "Oposición presentada", "Registraste la oposición presentada."],
];

export function Alerta() {
  const fechas = useMemo(() => {
    const informe = new Date(proximoInforme().getTime() - 7 * 86_400_000);
    const publicada = boletinDelInforme(informe);
    const vence = sumarDias(publicada, 30);
    return { informe, publicada, vence, quedan: diasEntre(hoyArgentina(), vence) };
  }, []);

  const [estado, setEstado] = useState<Estado>("analisis");
  const [avisado, setAvisado] = useState(false);
  const [historia, setHistoria] = useState<Hecho[]>(() => [
    { cuando: `${fechaSinAnio(hoyArgentina(fechas.informe))}, 8:00`, quien: "Monitor de Marcas", que: "Llegó en el informe de la semana." },
    { cuando: `Hoy, ${horaArgentina(new Date())}`, quien: "Vos", que: "La abriste y pasó a En análisis." },
  ]);

  const anotar = (que: string) =>
    setHistoria((h) => [...h, { cuando: `Hoy, ${horaArgentina(new Date())}`, quien: "Vos", que }]);

  const usados = 30 - fechas.quedan;
  const [ficha, vista, anima] = useVisto<HTMLElement>();

  return (
    <Seccion id="alerta" className="alerta">
      <div className="alerta-grilla">
        <div className="alerta-texto">
          <h2>Cada alerta es una ficha que se acuerda de todo.</h2>
          <p className="bajada">
            Las dos marcas lado a lado, el fundamento, el plazo que corre y quién hizo qué. Probá los botones de la ficha:
            así se trabaja una alerta.
          </p>
          <ul className="lista">
            <li>Abrirla la pasa a En análisis, para que el resto del estudio sepa que alguien ya la está mirando.</li>
            <li>Marcarla para oponer, registrar la oposición o descartarla queda en el seguimiento, con fecha y nombre.</li>
            <li>
              Avisar al cliente le manda un correo con la solicitud, el fundamento y el día en que vence la oposición. Si
              contesta, la respuesta te llega a vos.
            </li>
            <li>Las alertas se ordenan por gravedad y por lo que falta para que venza cada plazo.</li>
          </ul>
        </div>

        <div className="ficha-columna">
          <article ref={ficha} className={["ficha", anima ? "anima" : "", vista ? "visto" : ""].join(" ")} aria-label="Una alerta de ejemplo">
            <header className="ficha-cabeza">
              <h3>Quimbaya frente a Kimballa</h3>
              <div className="ficha-pildoras">
                <PildoraNivel nivel="critica" />
                <PildoraEstado key={estado} estado={estado} />
              </div>
            </header>

            <div className="comparacion" role="table" aria-label="Las dos marcas">
              <div className="comp-fila comp-titulos" role="row">
                <span role="columnheader" />
                <span role="columnheader">Marca del estudio</span>
                <span role="columnheader">Solicitud publicada</span>
              </div>
              {FILAS.map(([rotulo, tuya, publicada]) => (
                <div key={rotulo} className="comp-fila" role="row">
                  <span role="rowheader">{rotulo}</span>
                  <span role="cell" className={rotulo === "Acta" ? "mono" : undefined}>
                    {tuya}
                  </span>
                  <span role="cell" className={rotulo === "Acta" ? "mono" : undefined}>
                    {publicada}
                  </span>
                </div>
              ))}
              <div className="comp-fila" role="row">
                <span role="rowheader">Estado en el INPI</span>
                <span role="cell">
                  <PildoraInpi color="verde">Concedida</PildoraInpi>
                </span>
                <span role="cell">
                  <PildoraInpi color="ambar">Publicada</PildoraInpi>
                </span>
              </div>
            </div>

            <div className="ficha-bloque">
              <p className="ficha-rotulo">Fundamento</p>
              <p>
                Kimballa reproduce la pronunciación de Quimbaya: la k suena como qu y la doble l se lee como y. Escrita
                distinta, dicha es la misma marca, y quien la escuche puede tomar una por la otra.
              </p>
            </div>

            <div className="ficha-bloque">
              <div className="plazo-linea">
                <p className="ficha-rotulo">Plazo de oposición</p>
                <p className="cifra">quedan {fechas.quedan} días</p>
              </div>
              <div className="plazo-barra grande" aria-hidden="true">
                {Array.from({ length: 30 }, (_, i) => (
                  <i key={i} className={i < usados ? "usado" : undefined} style={{ "--i": i } as CSSProperties} />
                ))}
              </div>
              <p className="suave">
                Publicada el {fechaLarga(fechas.publicada)}. Vence el {fechaLarga(fechas.vence)}.
              </p>
            </div>

            <div className="ficha-bloque">
              <p className="ficha-rotulo">Seguimiento</p>
              <ol className="historia">
                {historia.map((h, i) => (
                  <li key={i}>
                    <span className="cifra">{h.cuando}</span>
                    <span>
                      <strong>{h.quien}</strong> {h.que}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <footer className="ficha-pie">
              {ACCIONES.map(([destino, texto, anotacion]) => (
                <button
                  key={destino}
                  type="button"
                  className="btn btn-borde"
                  disabled={estado === destino}
                  onClick={() => {
                    setEstado(destino);
                    anotar(anotacion);
                  }}
                >
                  {texto}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-solido"
                disabled={avisado}
                onClick={() => {
                  setAvisado(true);
                  anotar("Avisaste al cliente por correo.");
                }}
              >
                {avisado ? "Cliente avisado" : "Avisar al cliente"}
              </button>
            </footer>
          </article>

          {avisado ? (
            <article className="correo" aria-label="El correo que recibe el cliente">
              <div className="correo-sobre">
                <p>
                  <span>Asunto</span> Alerta de marca: Kimballa frente a Quimbaya
                </p>
                <p>
                  <span>Para</span> el correo de avisos de Tostadero Quimbaya
                </p>
              </div>
              <div className="correo-cuerpo">
                <p className="correo-titulo">Alerta sobre Quimbaya</p>
                <p>
                  En el Boletín de Marcas del INPI se publicó una solicitud que se parece a una marca de su cartera. El plazo
                  para oponerse vence el <strong>{fechaLarga(fechas.vence)}</strong>.
                </p>
                <dl className="correo-tabla">
                  {(
                    [
                      ["Marca de su cartera", "Quimbaya (clase 30)"],
                      ["Solicitud publicada", "Kimballa (clase 30)"],
                      ["Titular de la solicitud", "Ramiro Ezcurra"],
                      ["Acta", "4.812.301"],
                      ["Nivel", "Crítica"],
                      ["Motivo", "Parecido fonético"],
                      ["Vence la oposición", fechaLarga(fechas.vence)],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <span className="correo-boton">Ver la solicitud en el INPI</span>
                <p className="suave">Aviso enviado por tu estudio.</p>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </Seccion>
  );
}
