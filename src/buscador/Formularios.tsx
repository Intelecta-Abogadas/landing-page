import { useState, type FormEvent } from "react";
import { enlaceInterno, LEGALES } from "../piezas";
import type { Bloqueo, Pais } from "./tipos";

export type Datos = { nombre: string; correo: string; whatsapp: string; pais: string };

const ENTRADA: Partial<Record<Bloqueo, string>> = {
  sin_datos: "Ya usaste las búsquedas sin datos.",
  ip: "Desde esta conexión ya se usaron las búsquedas sin datos de hoy.",
  incognito: "En una ventana privada te pedimos los datos antes de buscar.",
};

/**
 * Name, e-mail and WhatsApp, the e-mail confirmed with a code. No password and no account: the
 * details unlock the searches of the days to come and nothing else.
 */
export function FormularioDatos({
  motivo,
  paises,
  inicial,
  cupo,
  meses,
  ocupado,
  error,
  inicio,
  onEnviar,
}: {
  motivo: Bloqueo;
  paises: Pais[];
  inicial: Datos;
  cupo: number;
  meses: number;
  ocupado: boolean;
  error: string | null;
  inicio: string;
  onEnviar: (d: Datos) => void;
}) {
  const [d, setD] = useState(inicial);
  const pais = paises.find((p) => p.codigo === d.pais) ?? paises[0];
  const cambiar = (campo: keyof Datos) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [campo]: e.target.value }));
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onEnviar(d);
  };

  return (
    <form className="panel-datos" onSubmit={enviar} noValidate>
      <h2 className="panel-titulo" tabIndex={-1} data-foco>
        Dejá tus datos y seguí buscando.
      </h2>
      <p className="panel-texto">
        {ENTRADA[motivo] ?? ""} Con tu nombre, tu correo y tu WhatsApp tenés {cupo} búsquedas por día durante {meses} meses. No
        hace falta crear una cuenta ni una contraseña: te mandamos un código al correo para confirmarlo.
      </p>

      <div className="datos-grilla">
        <label className="campo-texto campo-chico">
          <span>Nombre y apellido</span>
          <input value={d.nombre} onChange={cambiar("nombre")} autoComplete="name" maxLength={120} required />
        </label>
        <label className="campo-texto campo-chico">
          <span>Correo</span>
          <input type="email" value={d.correo} onChange={cambiar("correo")} autoComplete="email" inputMode="email" maxLength={160} required />
        </label>
        <label className="campo-texto campo-chico">
          <span>País</span>
          <select value={pais?.codigo ?? ""} onChange={cambiar("pais")} autoComplete="country">
            {paises.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre} (+{p.prefijo})
              </option>
            ))}
          </select>
        </label>
        <label className="campo-texto campo-chico">
          <span>WhatsApp</span>
          <span className="con-prefijo">
            <span className="prefijo mono" aria-hidden="true">
              +{pais?.prefijo ?? ""}
            </span>
            <input
              type="tel"
              value={d.whatsapp}
              onChange={cambiar("whatsapp")}
              autoComplete="tel-national"
              inputMode="tel"
              placeholder={pais?.codigo === "AR" ? "11 5555 4444" : undefined}
              maxLength={24}
              required
            />
          </span>
        </label>
      </div>

      {error ? (
        <p className="panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="acciones">
        <button type="submit" className="btn btn-solido" disabled={ocupado}>
          {ocupado ? "Mandando el código" : "Recibir el código"}
        </button>
      </div>
      <p className="panel-nota">
        Tus datos se tratan según la{" "}
        <a className="legal-enlace" href={enlaceInterno(inicio + LEGALES.privacidad.ruta)}>
          política de privacidad
        </a>
        .
      </p>
    </form>
  );
}

/** The six digits that arrived by e-mail. */
export function FormularioCodigo({
  correo,
  ocupado,
  error,
  onConfirmar,
  onOtroCodigo,
  onCambiarDatos,
}: {
  correo: string;
  ocupado: boolean;
  error: string | null;
  onConfirmar: (codigo: string) => void;
  onOtroCodigo: () => void;
  onCambiarDatos: () => void;
}) {
  const [codigo, setCodigo] = useState("");
  const listo = /^\d{6}$/.test(codigo);

  return (
    <form
      className="panel-datos"
      onSubmit={(e) => {
        e.preventDefault();
        if (listo) onConfirmar(codigo);
      }}
    >
      <h2 className="panel-titulo">Revisá tu correo.</h2>
      <p className="panel-texto">
        Te mandamos un código de 6 números a <strong>{correo}</strong>. Vence en 15 minutos. Si no lo ves, buscalo en el correo no
        deseado.
      </p>
      <label className="campo-texto campo-codigo">
        <span>Código</span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoFocus
          required
        />
      </label>
      {error ? (
        <p className="panel-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="acciones">
        <button type="submit" className="btn btn-solido" disabled={ocupado || !listo}>
          {ocupado ? "Confirmando" : "Confirmar"}
        </button>
        <button type="button" className="btn btn-borde" disabled={ocupado} onClick={onOtroCodigo}>
          Mandar otro código
        </button>
        <button type="button" className="btn btn-borde" disabled={ocupado} onClick={onCambiarDatos}>
          Cambiar los datos
        </button>
      </div>
    </form>
  );
}
