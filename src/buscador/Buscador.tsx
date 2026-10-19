import { useEffect, useRef, useState, type FormEvent } from "react";
import { URL_FORMULARIO } from "../piezas";
import { Cabecera } from "../secciones/Cabecera";
import { Pie } from "../secciones/Pie";
import * as api from "./api";
import { Rechazo } from "./api";
import { Clases } from "./Clases";
import { Cupo } from "./Cupo";
import { FichaMarca } from "./FichaMarca";
import { FormularioCodigo, FormularioDatos, type Datos } from "./Formularios";
import { esPrivado } from "./privado";
import { Resultados } from "./Resultados";
import { COINCIDENCIAS, diaArgentino, nombreVisible, textoDeFalla } from "./textos";
import type { Bloqueo, Busqueda, EstadoDelCupo, Pais, Registro } from "./tipos";

const INICIO = "../";
/** The allowance with the details confirmed, as the app counts it (`server/publico/cupo.ts`). */
const CUPO_CON_DATOS = 5;
const MESES_DE_PERMISO = 3;

type Pedido = { denominacion: string; clases: number[] };

type Etapa =
  | { tipo: "inicio" }
  | { tipo: "buscando"; pedido: Pedido }
  | { tipo: "resultados"; busqueda: Busqueda; clases: number[] }
  | { tipo: "datos"; motivo: Bloqueo }
  | { tipo: "codigo"; correo: string }
  | { tipo: "tope"; vuelveEn: string | null }
  | { tipo: "vencido" }
  | { tipo: "falla"; mensaje: string };

/** What the page shows before the first search, from the allowance the app reports. */
function etapaInicial(e: EstadoDelCupo, privado: boolean): Etapa {
  if (e.conDatos && e.vencido) return { tipo: "vencido" };
  if (e.conDatos && e.restantes === 0) return { tipo: "tope", vuelveEn: e.vuelveEn };
  if (!e.conDatos && privado) return { tipo: "datos", motivo: "incognito" };
  if (!e.conDatos && e.restantes === 0) return { tipo: "datos", motivo: "sin_datos" };
  return { tipo: "inicio" };
}

const SIN_DATOS: Datos = { nombre: "", correo: "", whatsapp: "", pais: "AR" };

export function Buscador() {
  const [texto, setTexto] = useState("");
  const [clases, setClases] = useState<number[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoDelCupo | null>(null);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "inicio" });
  const [pendiente, setPendiente] = useState<Pedido | null>(null);
  const [datos, setDatos] = useState<Datos>(SIN_DATOS);
  const [ocupado, setOcupado] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<{ registro: Registro; nombre: string } | null>(null);
  const privado = useRef<Promise<boolean> | null>(null);
  const zona = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const primera = useRef(true);

  useEffect(() => {
    privado.current = esPrivado();
    let vivo = true;
    Promise.all([api.estado(), privado.current])
      .then(([r, esPriv]) => {
        if (!vivo) return;
        setEstado(r.estado);
        setPaises(r.paises);
        setEtapa((e) => (e.tipo === "inicio" ? etapaInicial(r.estado, esPriv) : e));
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    zona.current?.querySelector<HTMLElement>("[data-foco]")?.focus({ preventScroll: false });
  }, [etapa.tipo]);

  async function asegurarPaises() {
    if (paises.length) return;
    try {
      const r = await api.estado();
      setPaises(r.paises);
      setEstado(r.estado);
    } catch {
      setPaises([{ codigo: "AR", nombre: "Argentina", prefijo: "54" }]);
    }
  }

  function rechazo(e: unknown) {
    if (!(e instanceof Rechazo)) {
      setEtapa({ tipo: "falla", mensaje: textoDeFalla({ codigo: "error", mensaje: "" }) });
      return;
    }
    if (e.estado) setEstado(e.estado);
    const f = e.falla;
    if (f.codigo === "datos_requeridos") {
      setErrorForm(null);
      setEtapa({ tipo: "datos", motivo: f.motivo ?? "sin_datos" });
      void asegurarPaises();
    } else if (f.codigo === "vencido") {
      setEtapa({ tipo: "vencido" });
    } else if (f.codigo === "cupo_diario") {
      setEtapa({ tipo: "tope", vuelveEn: f.vuelveEn ?? null });
    } else {
      setEtapa({ tipo: "falla", mensaje: textoDeFalla(f) });
    }
  }

  async function ejecutar(p: Pedido) {
    setPendiente(p);
    setEtapa({ tipo: "buscando", pedido: p });
    try {
      const esPriv = await (privado.current ?? Promise.resolve(false));
      const r = await api.buscar(p.denominacion, p.clases, esPriv);
      setEstado(r.estado);
      setPendiente(null);
      setEtapa({ tipo: "resultados", busqueda: r.busqueda, clases: p.clases });
    } catch (e) {
      rechazo(e);
    }
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    if (etapa.tipo === "buscando") return;
    const denominacion = texto.trim();
    const letras = denominacion.replace(/[^\p{L}\p{N}]/gu, "");
    if (letras.length < 2 || letras.length > 80) {
      setAviso("Escribí el nombre de la marca, entre 2 y 80 letras.");
      entrada.current?.focus();
      return;
    }
    setAviso(null);
    void ejecutar({ denominacion, clases });
  }

  async function enviarDatos(d: Datos) {
    setDatos(d);
    setOcupado(true);
    setErrorForm(null);
    try {
      const r = await api.pedirCodigo(d);
      setEtapa({ tipo: "codigo", correo: r.correo });
    } catch (e) {
      setErrorForm(textoDeFalla(e instanceof Rechazo ? e.falla : { codigo: "error", mensaje: "" }));
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar(correo: string, codigo: string) {
    setOcupado(true);
    setErrorForm(null);
    try {
      const r = await api.confirmar(correo, codigo);
      setEstado(r.estado);
      if (pendiente) void ejecutar(pendiente);
      else setEtapa(etapaInicial(r.estado, false));
    } catch (e) {
      setErrorForm(textoDeFalla(e instanceof Rechazo ? e.falla : { codigo: "error", mensaje: "" }));
    } finally {
      setOcupado(false);
    }
  }

  const buscando = etapa.tipo === "buscando";

  return (
    <>
      <Cabecera inicio={INICIO} actual="buscar" />
      <main className="buscador">
        <div className="marco">
          <header className="buscador-cabeza">
            <h1>Buscá si tu marca ya está registrada.</h1>
            <p className="bajada">
              Consultamos el registro del INPI en el momento y te mostramos las marcas en trámite y las concedidas que se escriben o
              suenan como la tuya, con su clase, su titular y sus productos.
            </p>
          </header>

          <form className="buscador-form" role="search" aria-label="Buscar una marca" onSubmit={buscar} noValidate>
            <label className="campo-texto buscador-marca">
              <span>Marca</span>
              <input
                ref={entrada}
                value={texto}
                maxLength={80}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={aviso ? true : undefined}
                aria-describedby={aviso ? "buscador-aviso" : undefined}
                onChange={(e) => setTexto(e.target.value)}
              />
            </label>
            <Clases valor={clases} onCambio={setClases} disabled={buscando} />
            <button type="submit" className="btn btn-solido buscador-boton" aria-disabled={buscando || undefined}>
              {buscando ? "Buscando" : "Buscar"}
            </button>
          </form>
          {aviso ? (
            <p id="buscador-aviso" className="buscador-aviso" role="alert">
              {aviso}
            </p>
          ) : null}

          <Cupo estado={estado} />

          <div ref={zona} className="buscador-zona">
            <Zona
              etapa={etapa}
              estado={estado}
              paises={paises}
              datos={datos}
              ocupado={ocupado}
              errorForm={errorForm}
              pendiente={pendiente}
              onAbrir={(registro, nombre) => setAbierta({ registro, nombre })}
              onEnviarDatos={(d) => void enviarDatos(d)}
              onConfirmar={(correo, codigo) => void confirmar(correo, codigo)}
              onCambiarDatos={() => {
                setErrorForm(null);
                setEtapa({ tipo: "datos", motivo: "sin_datos" });
              }}
              onReintentar={() => pendiente && void ejecutar(pendiente)}
            />
          </div>
        </div>
      </main>
      <FichaMarca registro={abierta?.registro ?? null} nombre={abierta?.nombre ?? ""} onCerrar={() => setAbierta(null)} />
      <Pie inicio={INICIO} actual="buscar" />
    </>
  );
}

function Zona({
  etapa,
  estado,
  paises,
  datos,
  ocupado,
  errorForm,
  pendiente,
  onAbrir,
  onEnviarDatos,
  onConfirmar,
  onCambiarDatos,
  onReintentar,
}: {
  etapa: Etapa;
  estado: EstadoDelCupo | null;
  paises: Pais[];
  datos: Datos;
  ocupado: boolean;
  errorForm: string | null;
  pendiente: Pedido | null;
  onAbrir: (r: Registro, nombre: string) => void;
  onEnviarDatos: (d: Datos) => void;
  onConfirmar: (correo: string, codigo: string) => void;
  onCambiarDatos: () => void;
  onReintentar: () => void;
}) {
  switch (etapa.tipo) {
    case "inicio":
      return (
        <section className="aparece guia" aria-labelledby="guia-titulo">
          <h2 id="guia-titulo" className="guia-titulo">
            Cómo ordenamos lo que encontramos
          </h2>
          <dl className="guia-lista">
            {COINCIDENCIAS.map((c) => (
              <div key={c.v}>
                <dt>{c.t}</dt>
                <dd>{c.ayuda}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case "buscando":
      return (
        <div className="aparece consultando" role="status">
          <span className="barra-buscando" aria-hidden="true" />
          <p>Consultando el INPI con {nombreVisible(etapa.pedido.denominacion.toUpperCase())} y las formas que suenan igual.</p>
          <div className="filas-fantasma" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} />
            ))}
          </div>
        </div>
      );
    case "resultados":
      return (
        <div className="aparece" key={etapa.busqueda.denominacion + etapa.clases.join(",")}>
          <Resultados busqueda={etapa.busqueda} clases={etapa.clases} onAbrir={onAbrir} />
          <p className="resultados-nota">La búsqueda muestra el registro del INPI; no reemplaza el análisis de un abogado de marcas.</p>
        </div>
      );
    case "datos":
      return (
        <div className="aparece">
          {paises.length ? (
            <FormularioDatos
              key="datos"
              motivo={etapa.motivo}
              paises={paises}
              inicial={datos}
              cupo={CUPO_CON_DATOS}
              meses={MESES_DE_PERMISO}
              ocupado={ocupado}
              error={errorForm}
              inicio={INICIO}
              onEnviar={onEnviarDatos}
            />
          ) : (
            <div className="consultando" role="status">
              <span className="barra-buscando" aria-hidden="true" />
            </div>
          )}
        </div>
      );
    case "codigo":
      return (
        <div className="aparece">
          <FormularioCodigo
            correo={etapa.correo}
            ocupado={ocupado}
            error={errorForm}
            onConfirmar={(codigo) => onConfirmar(etapa.correo, codigo)}
            onOtroCodigo={() => onEnviarDatos(datos)}
            onCambiarDatos={onCambiarDatos}
          />
        </div>
      );
    case "tope":
      return (
        <section className="aparece panel-datos" aria-labelledby="tope-titulo">
          <h2 id="tope-titulo" className="panel-titulo" tabIndex={-1} data-foco>
            Ya hiciste las {estado?.cupo ?? CUPO_CON_DATOS} búsquedas de hoy.
          </h2>
          <p className="panel-texto">
            {etapa.vuelveEn ? `El ${diaArgentino(etapa.vuelveEn)} a las 0:00 tenés ${estado?.cupo ?? CUPO_CON_DATOS} más.` : "Mañana tenés más."}{" "}
            Monitor de Marcas vigila la cartera de tu estudio contra cada Boletín de Marcas del INPI.
          </p>
          <div className="acciones">
            <a className="btn btn-solido" href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
              Solicitar demo
            </a>
          </div>
        </section>
      );
    case "vencido":
      return (
        <section className="aparece panel-datos" aria-labelledby="vencido-titulo">
          <h2 id="vencido-titulo" className="panel-titulo" tabIndex={-1} data-foco>
            Terminaron tus {MESES_DE_PERMISO} meses de búsquedas.
          </h2>
          <p className="panel-texto">
            Para seguir, pedí una demostración: Monitor de Marcas vigila la cartera de tu estudio contra cada Boletín de Marcas del
            INPI y te avisa de las solicitudes que se parecen a tus marcas.
          </p>
          <div className="acciones">
            <a className="btn btn-solido" href={URL_FORMULARIO} target="_blank" rel="noopener noreferrer">
              Solicitar demo
            </a>
          </div>
        </section>
      );
    case "falla":
      return (
        <div className="aparece panel-datos">
          <p className="panel-error" role="alert" tabIndex={-1} data-foco>
            {etapa.mensaje}
          </p>
          {pendiente ? (
            <div className="acciones">
              <button type="button" className="btn btn-borde" onClick={onReintentar}>
                Probar de nuevo
              </button>
            </div>
          ) : null}
        </div>
      );
  }
}
