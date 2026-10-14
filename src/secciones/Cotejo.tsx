import { useMemo, useState, type CSSProperties } from "react";
import { claves, cotejar, UMBRAL, type Dimension } from "../cotejo";
import ejemplos from "../cotejo/ejemplos.json";
import { useDescifra, useNumero } from "../movimiento";
import { decimal, Seccion } from "../piezas";

const DIMENSIONES: Array<[Dimension, string, string]> = [
  ["literal", "Letra por letra", "Las dos denominaciones escritas, sin artículos ni razón social."],
  ["castellano", "Cómo suena en castellano", "C, s y z suenan igual; b y v, también; la h no suena. Dos claves distintas tienen que coincidir."],
  ["ingles", "Cómo suena en inglés", "Para las marcas en inglés o mezcladas. Nunca decide sola."],
  ["contencion", "Una palabra dentro de otra", "Tu marca entera adentro de una más larga, o las mismas palabras pegadas."],
];

const PRINCIPAL: Record<Dimension, string> = {
  literal: "por cómo se escribe",
  castellano: "por cómo suena en castellano",
  ingles: "por cómo suena en inglés",
  contencion: "porque una está dentro de la otra",
};

export function Cotejo() {
  const [tuya, setTuya] = useState(ejemplos[0].tuya);
  const [publicada, setPublicada] = useState(ejemplos[0].publicada);

  const r = useMemo(() => cotejar(tuya, publicada), [tuya, publicada]);
  const vacio = !tuya.trim() || !publicada.trim();
  const pasa = !vacio && r.parecido >= UMBRAL;
  const topado = !vacio && !pasa && Math.max(r.literal, r.castellano, r.ingles, r.contencion) >= UMBRAL;
  const palabras = useMemo(() => [...claves(tuya), ...claves(publicada)], [tuya, publicada]);

  return (
    <Seccion id="cotejo" className="cotejo">
      <div className="cotejo-grilla">
        <div className="cotejo-entrada">
          <h2>Probá el filtro con dos marcas.</h2>
          <p className="bajada">
            Es el filtro del sistema, el mismo, regla por regla, y corre acá, en tu navegador: lo que escribas no sale
            de esta página.
          </p>

          <label className="campo-texto">
            <span>Tu marca</span>
            <input value={tuya} maxLength={80} spellCheck={false} onChange={(e) => setTuya(e.target.value)} />
          </label>
          <label className="campo-texto">
            <span>La solicitud publicada</span>
            <input value={publicada} maxLength={80} spellCheck={false} onChange={(e) => setPublicada(e.target.value)} />
          </label>

          <div className="ejemplos" role="group" aria-label="Ejemplos">
            {ejemplos.map((e) => {
              const elegido = e.tuya === tuya && e.publicada === publicada;
              return (
                <button
                  key={e.titulo}
                  type="button"
                  className={elegido ? "ejemplo elegido" : "ejemplo"}
                  aria-pressed={elegido}
                  onClick={() => {
                    setTuya(e.tuya);
                    setPublicada(e.publicada);
                  }}
                >
                  <span>{e.titulo}</span>
                  <span className="ejemplo-par">
                    {e.tuya} y {e.publicada}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="resultado" aria-live="polite">
          <div key={vacio ? "vacio" : pasa ? "pasa" : "afuera"} className={vacio ? "veredicto" : pasa ? "veredicto pasa" : "veredicto afuera"}>
            <p className="veredicto-titulo">
              {vacio ? "Escribí las dos marcas." : pasa ? "Pasa a la revisión." : "Queda afuera del informe."}
            </p>
            <p className="veredicto-razon">
              {vacio
                ? "El cotejo se calcula mientras escribís."
                : pasa
                  ? `Parecido ${decimal(r.parecido)}, ${PRINCIPAL[r.principal]}. Desde ${decimal(UMBRAL)}, el par lo lee el análisis con criterio de marcas.`
                  : topado
                    ? `Parecido ${decimal(r.parecido)}. Comparten una palabra, pero escritas enteras se parecen demasiado poco: el filtro no deja que una sola palabra decida.`
                    : `Parecido ${decimal(r.parecido)}. Hace falta ${decimal(UMBRAL)} para pasar.`}
            </p>
          </div>

          <ul className="dimensiones">
            {DIMENSIONES.map(([d, nombre, ayuda]) => {
              const valor = vacio ? 0 : r[d];
              const gana = !vacio && d === r.principal && r.parecido > 0;
              return (
                <li key={d} className={gana ? "dimension gana" : "dimension"}>
                  <div className="dimension-cabeza">
                    <span className="dimension-nombre">{nombre}</span>
                    <Valor valor={valor} vacio={vacio} />
                  </div>
                  <div className="medidor" style={{ "--v": valor, "--u": UMBRAL } as CSSProperties}>
                    <i />
                  </div>
                  <p className="dimension-ayuda">{ayuda}</p>
                </li>
              );
            })}
          </ul>

          <div className="oido">
            <p className="oido-titulo">Así lo escucha el filtro</p>
            <table>
              <thead>
                <tr>
                  <th>Palabra</th>
                  <th>Clave rioplatense</th>
                  <th>Clave castellana</th>
                  <th>Clave inglesa</th>
                </tr>
              </thead>
              <tbody>
                {palabras.length ? (
                  palabras.map((p, i) => (
                    <tr key={`${p.palabra}-${i}`}>
                      <td>{p.palabra}</td>
                      <Clave texto={p.castellano} />
                      <Clave texto={p.metaphone} />
                      <Clave texto={p.ingles} />
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Seccion>
  );
}

function Valor({ valor, vacio }: { valor: number; vacio: boolean }) {
  const v = useNumero(vacio ? 0 : valor, 480);
  return <span className="dimension-valor cifra">{vacio || valor === 0 ? "-" : decimal(v)}</span>;
}

function Clave({ texto }: { texto: string }) {
  return <td className="mono">{useDescifra(texto.toLowerCase())}</td>;
}
