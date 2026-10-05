import { useEffect, useState, type CSSProperties } from "react";
import { boletinDelInforme, fechaSinAnio, hoyArgentina, proximoInforme } from "../fechas";
import { URL_FORMULARIO, URL_SISTEMA } from "../piezas";

const dos = (n: number) => String(n).padStart(2, "0");

/** Each digit is a strip from 0 to 9 that rolls to its value. */
function Odometro({ valor }: { valor: string }) {
  return (
    <span className="odometro">
      {valor.split("").map((c, i) => (
        <span key={i} className="odo">
          <span className="odo-tira" style={{ "--d": Number(c) } as CSSProperties}>
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Cierre() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const informe = proximoInforme(ahora);
  const boletin = boletinDelInforme(informe);
  const yaSalio = boletin.getTime() <= hoyArgentina(ahora).getTime();
  const falta = Math.max(0, informe.getTime() - ahora.getTime());
  const partes: Array<[number, string]> = [
    [Math.floor(falta / 86_400_000), "días"],
    [Math.floor(falta / 3_600_000) % 24, "horas"],
    [Math.floor(falta / 60_000) % 60, "minutos"],
    [Math.floor(falta / 1000) % 60, "segundos"],
  ];

  return (
    <section className="cierre" aria-labelledby="cierre-titulo">
      <div className="marco cierre-grilla">
        <div>
          <h2 id="cierre-titulo">
            {yaSalio
              ? `El boletín del ${fechaSinAnio(boletin)} ya salió.`
              : `El próximo boletín sale el ${fechaSinAnio(boletin)}.`}{" "}
            <span>El informe llega el {fechaSinAnio(hoyArgentina(informe))} a las 8:00.</span>
          </h2>
          <div className="acciones">
            <a className="btn btn-claro" href={URL_SISTEMA}>
              Ingresar al sistema
            </a>
            <a className="btn btn-borde-claro" href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
              Solicitar demo
            </a>
          </div>
        </div>

        <div className="cuenta" role="timer" aria-label="Lo que falta para el próximo informe">
          {partes.map(([n, nombre]) => (
            <div key={nombre} className="cuenta-celda">
              <Odometro valor={dos(n)} />
              <span>{nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
