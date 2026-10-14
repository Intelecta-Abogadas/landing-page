import { useEffect, useRef, useState, type CSSProperties } from "react";
import { azar, entradaSalida, mezclar, tramo, useNumero, useRecorrido, useVisto } from "../movimiento";
import { NIVEL, type Nivel } from "../piezas";

const PUNTOS = 3700;
const PASAN = 88;

const ETAPAS = [
  {
    nodo: "Boletín",
    cuando: "Miércoles, a la mañana",
    titulo: "solicitudes nuevas entran un Miércoles promedio.",
    texto:
      "El sistema busca el boletín cada diez minutos y lo baja apenas sale. Cada punto es una solicitud, y cada una se mira contra cada marca de tu cartera.",
  },
  {
    nodo: "Filtro",
    cuando: "Miércoles, desde las 10:00",
    titulo: "El filtro las mira de cuatro formas.",
    texto:
      "Letra por letra, cómo suena en castellano, cómo suena en inglés y si una contiene a la otra. Lo que no llega al umbral se cae.",
  },
  {
    nodo: "Criterio",
    cuando: "Durante la noche",
    titulo: "Lo que pasa, lo lee el criterio.",
    texto:
      "Decide si hay riesgo de confusión, qué tan grave es, y deja escrito por qué. Lo que no es relevante también se cae.",
  },
  {
    nodo: "Informe",
    cuando: "Jueves, 8:00",
    titulo: "El informe, en tu correo.",
    texto:
      "Cliente por cliente, por gravedad, con el plazo de oposición corriendo. Si el análisis no terminó, el informe espera: llega completo antes que puntual.",
  },
];

const FILAS: Array<{ nivel: Nivel; par: string; cliente: string }> = [
  { nivel: "identica", par: "Hilvana frente a Hilvana", cliente: "Hilvana Textil" },
  { nivel: "critica", par: "Quimbaya frente a Kimballa", cliente: "Tostadero Quimbaya" },
  { nivel: "alta", par: "Brújula frente a Brújula Viajes del Sur", cliente: "Agencia Brújula" },
  { nivel: "revisar", par: "Nube frente a Nube Escarlata", cliente: "Lucía Ferrante" },
];

const COLOR: Record<Nivel, [number, number, number]> = {
  identica: [198, 40, 40],
  critica: [234, 88, 12],
  alta: [224, 138, 0],
  revisar: [42, 80, 144],
};

// Where each stage sits along the section's scroll.
const FILTRO: [number, number] = [0.16, 0.46];
const CRITERIO: [number, number] = [0.5, 0.68];
const INFORME: [number, number] = [0.72, 0.9];

const etapaDe = (p: number) => (p < FILTRO[0] + 0.02 ? 0 : p < CRITERIO[0] ? 1 : p < INFORME[0] ? 2 : 3);

type Punto = { fx: number; fy: number; r: number; caida: number; deriva: number; demora: number; pasa: number; queda: number };

export function Embudo() {
  const [seccion, p] = useRecorrido<HTMLElement>();
  const [marcaVista, vista] = useVisto<HTMLDivElement>("0px");
  const cuenta = useNumero(vista ? 3700 : 0, 1400);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const anclas = useRef<Array<HTMLElement | null>>([]);
  const [version, setVersion] = useState(0);
  const estado = useRef<{ ancho: number; alto: number; puntos: Punto[]; destinos: Array<{ x: number; y: number }> }>({
    ancho: 0,
    alto: 0,
    puntos: [],
    destinos: [],
  });

  // The field: positions and fates are fixed per dot, so scrolling back plays it backwards.
  useEffect(() => {
    const canvas = lienzo.current;
    const contenedor = caja.current;
    if (!canvas || !contenedor) return;
    const armar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ancho = contenedor.clientWidth;
      const alto = contenedor.clientHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cantidad = ancho < 600 ? 1600 : PUNTOS;
      const paso = Math.sqrt((ancho * alto) / cantidad);
      const columnas = Math.max(1, Math.floor(ancho / paso));
      const pasoY = alto / Math.ceil(cantidad / columnas);
      const r = azar(7);
      const elegidos = new Set<number>();
      while (elegidos.size < PASAN) elegidos.add(Math.floor(r() * cantidad));
      const pasan = [...elegidos];
      const quedan = new Map(pasan.slice(0, FILAS.length).map((v, k) => [v, k]));
      const lugar = new Map(pasan.map((v, k) => [v, k]));
      estado.current.puntos = Array.from({ length: cantidad }, (_, i) => ({
        fx: (i % columnas) * paso + paso / 2 + (r() - 0.5) * paso * 0.5,
        fy: Math.floor(i / columnas) * pasoY + pasoY / 2 + (r() - 0.5) * pasoY * 0.5,
        r: 1.1 + r() * 0.9,
        caida: 0.6 + r() * 0.8,
        deriva: (r() - 0.5) * 60,
        demora: r(),
        pasa: lugar.has(i) ? (lugar.get(i) as number) : -1,
        queda: quedan.has(i) ? (quedan.get(i) as number) : -1,
      }));
      estado.current.ancho = ancho;
      estado.current.alto = alto;
      const base = contenedor.getBoundingClientRect();
      estado.current.destinos = anclas.current.map((a) => {
        if (!a) return { x: ancho / 2, y: alto / 2 };
        const b = a.getBoundingClientRect();
        return { x: b.left - base.left + b.width / 2, y: b.top - base.top + b.height / 2 };
      });
      setVersion((v) => v + 1);
    };
    armar();
    const o = new ResizeObserver(armar);
    o.observe(contenedor);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    const ctx = lienzo.current?.getContext("2d");
    const { ancho, alto, puntos, destinos } = estado.current;
    if (!ctx || !ancho) return;
    ctx.clearRect(0, 0, ancho, alto);

    const filtro = tramo(p, FILTRO[0], FILTRO[1]);
    const criterio = tramo(p, CRITERIO[0], CRITERIO[1]);
    const informe = tramo(p, INFORME[0], INFORME[1]);
    const lado = Math.ceil(Math.sqrt(PASAN * 1.4));
    const sep = Math.min(30, ancho / (lado + 5));
    const cx = ancho * 0.5 - ((lado - 1) * sep) / 2;
    const cy = alto * 0.42 - ((Math.ceil(PASAN / lado) - 1) * sep) / 2;

    for (const d of puntos) {
      let x = d.fx;
      let y = d.fy;
      let a = 0.3 + d.r * 0.1;
      let s = d.r * 1.3;
      let color: [number, number, number] = [13, 37, 80];

      if (d.pasa < 0) {
        const t = tramo(filtro, d.demora * 0.45, 0.55 + d.demora * 0.45);
        const c = t * t;
        y = d.fy + c * (alto - d.fy + 80) * d.caida;
        x = d.fx + c * d.deriva;
        a *= 1 - t;
        if (a <= 0.01) continue;
      } else {
        const t = entradaSalida(tramo(filtro, 0.1, 0.9));
        const gx = cx + (d.pasa % lado) * sep;
        const gy = cy + Math.floor(d.pasa / lado) * sep;
        x = mezclar(d.fx, gx, t);
        y = mezclar(d.fy, gy, t);
        a = mezclar(a, 0.75, t);
        s = mezclar(d.r * 1.3, 5, t);
        color = [0, 76, 206];

        if (d.queda < 0) {
          const k = tramo(criterio, (d.pasa % 7) * 0.06, 0.6 + (d.pasa % 7) * 0.06);
          a *= 1 - k;
          s *= 1 - k * 0.6;
          y += k * k * 120;
          color = [mezclar(0, 138, k), mezclar(76, 148, k), mezclar(206, 163, k)] as [number, number, number];
          if (a <= 0.01) continue;
        } else {
          const nivel = FILAS[d.queda].nivel;
          const k = entradaSalida(criterio);
          const lx = ancho * 0.5;
          const ly = alto * 0.3 + d.queda * Math.min(64, alto * 0.1);
          x = mezclar(x, lx, k);
          y = mezclar(y, ly, k);
          s = mezclar(s, 13, k);
          a = mezclar(a, 1, k);
          color = COLOR[nivel].map((v, i) => mezclar([0, 76, 206][i], v, k)) as [number, number, number];
          const m = entradaSalida(tramo(informe, d.queda * 0.1, 0.6 + d.queda * 0.1));
          const destino = destinos[d.queda];
          if (destino) {
            x = mezclar(x, destino.x, m);
            y = mezclar(y, destino.y, m);
            s = mezclar(s, 12, m);
          }
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${a * 0.16 * k})`;
          ctx.beginPath();
          ctx.arc(x, y, s * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${a})`;
          ctx.beginPath();
          ctx.arc(x, y, s / 2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
      }
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${a})`;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }, [p, version]);

  const etapa = etapaDe(p);
  const informe = tramo(p, INFORME[0], INFORME[1]);

  return (
    <section className="embudo" id="embudo" ref={seccion}>
      <div className="embudo-fijo">
        <div className="embudo-texto" ref={marcaVista}>
          <ol className="embudo-etapas" aria-hidden="true">
            {ETAPAS.map((e, i) => (
              <li key={e.nodo} className={i < etapa ? "hecha" : i === etapa ? "activa" : undefined}>
                {e.nodo}
              </li>
            ))}
            <i style={{ "--avance": p } as CSSProperties} />
          </ol>
          <div className="embudo-relatos">
            {ETAPAS.map((e, i) => (
              <div key={e.nodo} className={i === etapa ? "relato activo" : "relato"} aria-hidden={i !== etapa}>
                {i === 0 ? (
                  <p className="relato-cifra cifra">{Math.round(cuenta).toLocaleString("es-AR")}</p>
                ) : null}
                <p className="relato-cuando">{e.cuando}</p>
                <h2>{e.titulo}</h2>
                <p className="relato-texto">{e.texto}</p>
                {i === 0 ? (
                  <p className="relato-fuente">
                    El promedio de solicitudes por semana en los Boletines de Marcas Nuevas del INPI, de Junio a Septiembre
                    de 2026.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="embudo-lienzo" ref={caja} aria-hidden="true">
          <canvas ref={lienzo} />
          <ol className="informe-filas">
            {FILAS.map((f, i) => {
              const t = tramo(informe, 0.2 + i * 0.08, 0.6 + i * 0.08);
              return (
                <li key={f.par} className="informe-fila" style={{ "--t": t } as CSSProperties}>
                  <span
                    className="informe-punto"
                    ref={(el) => {
                      anclas.current[i] = el;
                    }}
                  />
                  <span className={`informe-nivel h-${f.nivel}`}>{NIVEL[f.nivel]}</span>
                  <span className="informe-par">{f.par}</span>
                  <span className="informe-cliente">{f.cliente}</span>
                  <span className="informe-plazo cifra">quedan 29 días</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
