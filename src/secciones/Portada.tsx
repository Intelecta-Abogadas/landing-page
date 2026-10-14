import { useEffect, useRef } from "react";
import { fechaSinAnio, hoyArgentina, proximoMiercoles } from "../fechas";
import { azar, limitar, quieto, salida, useEnPantalla } from "../movimiento";
import { NIVEL, type Nivel } from "../piezas";

/** One dot per application: a Wednesday brings about 3,700 (June to September 2026). */
const PUNTOS = 3700;

const HALLAZGOS: Array<{ x: number; y: number; nivel: Nivel; nombre: string; razon: string }> = [
  { x: 0.3, y: 0.27, nivel: "critica", nombre: "Kimballa", razon: "suena como Quimbaya" },
  { x: 0.57, y: 0.16, nivel: "identica", nombre: "Hilvana", razon: "igual a Hilvana" },
  { x: 0.4, y: 0.58, nivel: "alta", nombre: "Brújula Viajes del Sur", razon: "contiene a Brújula" },
  { x: 0.76, y: 0.44, nivel: "revisar", nombre: "Nube Escarlata", razon: "comparte Nube" },
  { x: 0.63, y: 0.79, nivel: "critica", nombre: "La Tolkara S.A.", razon: "es Tolkara" },
];

const COLOR: Record<Nivel, string> = {
  identica: "#c62828",
  critica: "#ea580c",
  alta: "#e08a00",
  revisar: "#2a5090",
};

const BARRIDO_MS = 5600;
const PAUSA_MS = 1800;
const VUELTA_MS = 900;

export function Portada() {
  const proximo = proximoMiercoles();
  const esHoy = proximo.getTime() === hoyArgentina().getTime();

  return (
    <section className="portada" id="arriba">
      <Campo />
      <div className="portada-texto">
        <h1 className="titulo-entra">
          <span className="renglon">
            <span>Treinta días</span>
          </span>
          <span className="renglon">
            <span>para oponerse.</span>
          </span>
          <span className="renglon acento">
            <span>Ninguno perdido</span>
          </span>
          <span className="renglon acento">
            <span>leyendo el boletín.</span>
          </span>
        </h1>
        <p className="bajada entra" style={{ animationDelay: "0.55s" }}>
          Cada Miércoles el INPI publica miles de solicitudes de marca. Monitor de Marcas las coteja contra la cartera de tu
          estudio y el Jueves a las 8:00 te deja, cliente por cliente, las que se parecen a las tuyas: con el nivel de
          riesgo, el fundamento y el plazo corriendo.
        </p>
        <div className="acciones entra" style={{ animationDelay: "0.7s" }}>
          <a className="btn btn-solido" href="#cotejo">
            Probar el cotejo
          </a>
          <a className="btn btn-borde" href="#embudo">
            Ver cómo trabaja
          </a>
        </div>
        <p className="en-vivo entra" style={{ animationDelay: "0.85s" }}>
          <i aria-hidden="true" />
          {esHoy ? `El boletín sale hoy, ${fechaSinAnio(proximo)}.` : `El próximo boletín sale el ${fechaSinAnio(proximo)}.`}
        </p>
      </div>
    </section>
  );
}

function Campo() {
  const [caja, enPantalla] = useEnPantalla<HTMLDivElement>();
  const lienzo = useRef<HTMLCanvasElement>(null);
  const etiquetas = useRef<Array<HTMLDivElement | null>>([]);
  const puntero = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = lienzo.current;
    const contenedor = caja.current;
    if (!canvas || !contenedor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ancho = 0;
    let alto = 0;
    let puntos: Array<{ x: number; y: number; r: number; brillo: number }> = [];
    let hallados: Array<{ x: number; y: number }> = [];

    const armar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = contenedor.clientWidth;
      alto = contenedor.clientHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cantidad = ancho < 600 ? 1600 : PUNTOS;
      const paso = Math.sqrt((ancho * alto) / cantidad);
      const columnas = Math.max(1, Math.floor(ancho / paso));
      const filas = Math.ceil(cantidad / columnas);
      const pasoY = alto / filas;
      const r = azar(11);
      puntos = Array.from({ length: cantidad }, (_, i) => ({
        x: (i % columnas) * paso + paso / 2 + (r() - 0.5) * paso * 0.5,
        y: Math.floor(i / columnas) * pasoY + pasoY / 2 + (r() - 0.5) * pasoY * 0.5,
        r: 1.1 + r() * 0.9,
        brillo: r(),
      }));
      hallados = HALLAZGOS.map((h) => ({ x: h.x * ancho, y: h.y * alto }));
    };
    armar();
    const alCambiar = new ResizeObserver(armar);
    alCambiar.observe(contenedor);

    const dibujar = (ahora: number) => {
      const ciclo = BARRIDO_MS + PAUSA_MS + VUELTA_MS;
      const t = quieto() ? BARRIDO_MS : ahora % ciclo;
      const haz = t < BARRIDO_MS ? -80 + (ancho + 160) * (t / BARRIDO_MS) : ancho + 80;
      const apaga = t > BARRIDO_MS + PAUSA_MS ? limitar((t - BARRIDO_MS - PAUSA_MS) / VUELTA_MS) : 0;
      const p = puntero.current;

      ctx.clearRect(0, 0, ancho, alto);

      if (t < BARRIDO_MS) {
        const g = ctx.createLinearGradient(haz - 140, 0, haz + 6, 0);
        g.addColorStop(0, "rgba(47,127,241,0)");
        g.addColorStop(0.85, "rgba(47,127,241,0.10)");
        g.addColorStop(1, "rgba(47,127,241,0.28)");
        ctx.fillStyle = g;
        ctx.fillRect(haz - 140, 0, 146, alto);
        ctx.fillStyle = "rgba(47,127,241,0.55)";
        ctx.fillRect(haz, 0, 1.5, alto);
      }

      for (const d of puntos) {
        let x = d.x;
        let y = d.y;
        let luz = 0;
        if (p) {
          const dx = x - p.x;
          const dy = y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const k = 1 - dist / 110;
            x += (dx / (dist || 1)) * k * 10;
            y += (dy / (dist || 1)) * k * 10;
            luz = Math.max(luz, k * 0.8);
          }
        }
        const cerca = haz - x;
        if (cerca > -4 && cerca < 120) luz = Math.max(luz, 1 - Math.abs(cerca - 20) / 110);
        const a = 0.24 + d.brillo * 0.16 + luz * 0.5;
        ctx.fillStyle = luz > 0.25 ? `rgba(0,76,206,${a})` : `rgba(13,37,80,${a})`;
        const s = d.r * 1.2 * (1 + luz * 0.7);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }

      HALLAZGOS.forEach((h, i) => {
        const pos = hallados[i];
        if (!pos) return;
        const encendido = haz > pos.x;
        const desde = encendido ? limitar((haz - pos.x) / 220) : 0;
        const fuerza = encendido ? salida(desde) * (1 - apaga) : 0;
        const etiqueta = etiquetas.current[i];
        if (etiqueta) etiqueta.dataset.ver = fuerza > 0.15 ? "si" : "no";
        if (fuerza <= 0) return;
        ctx.globalAlpha = fuerza;
        ctx.fillStyle = COLOR[h.nivel];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLOR[h.nivel];
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = fuerza * (1 - desde) * 0.7;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6 + desde * 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    };

    let cuadro = 0;
    const correr = (ahora: number) => {
      dibujar(ahora);
      cuadro = requestAnimationFrame(correr);
    };
    if (quieto()) dibujar(0);
    else if (enPantalla) cuadro = requestAnimationFrame(correr);
    else dibujar(BARRIDO_MS);

    return () => {
      cancelAnimationFrame(cuadro);
      alCambiar.disconnect();
    };
  }, [caja, enPantalla]);

  useEffect(() => {
    const contenedor = caja.current;
    if (!contenedor || !window.matchMedia("(pointer: fine)").matches) return;
    const mover = (e: PointerEvent) => {
      const r = contenedor.getBoundingClientRect();
      puntero.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const salir = () => {
      puntero.current = null;
    };
    contenedor.addEventListener("pointermove", mover);
    contenedor.addEventListener("pointerleave", salir);
    return () => {
      contenedor.removeEventListener("pointermove", mover);
      contenedor.removeEventListener("pointerleave", salir);
    };
  }, [caja]);

  return (
    <div className="campo" ref={caja} aria-hidden="true">
      <canvas ref={lienzo} />
      {HALLAZGOS.map((h, i) => (
        <div
          key={h.nombre}
          ref={(el) => {
            etiquetas.current[i] = el;
          }}
          className={h.x > 0.62 ? `hallazgo a-la-izquierda h-${h.nivel}` : `hallazgo h-${h.nivel}`}
          data-ver={quieto() ? "si" : "no"}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
        >
          <span className="hallazgo-nivel">{NIVEL[h.nivel]}</span>
          <span className="hallazgo-nombre">{h.nombre}</span>
          <span className="hallazgo-razon">{h.razon}</span>
        </div>
      ))}
    </div>
  );
}
