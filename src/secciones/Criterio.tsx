import { Fragment, type CSSProperties } from "react";
import { sinAcentos } from "../cotejo/texto";
import { useVisto } from "../movimiento";
import { PildoraNivel, Seccion, type Nivel } from "../piezas";

const NIVELES: Array<{ nivel: Nivel; tuya: string; publicada: string; fundamento: string }> = [
  {
    nivel: "identica",
    tuya: "Hilvana",
    publicada: "Hilvana",
    fundamento: "La misma denominación. No hay nada que interpretar: se avisa siempre.",
  },
  {
    nivel: "critica",
    tuya: "Quimbaya",
    publicada: "Kimballa",
    fundamento: "Se escriben distinto y se pronuncian igual. Quien escuche una puede pedir la otra: es confusión directa.",
  },
  {
    nivel: "alta",
    tuya: "Brújula",
    publicada: "Brújula Viajes del Sur",
    fundamento:
      "Reproduce tu marca entera y le suma palabras que sólo describen un servicio. El público la va a leer como una línea tuya.",
  },
  {
    nivel: "revisar",
    tuya: "Nube",
    publicada: "Nube Escarlata",
    fundamento:
      "Comparten una palabra breve y corriente, y lo que se agrega trae una imagen propia que domina el conjunto. Conviene mirarla; no es un choque directo.",
  },
];

/** Which letters of each mark belong to the longest sequence they share, accents aside. */
function alinear(a: string, b: string): [boolean[], boolean[]] {
  const x = sinAcentos(a.toLowerCase());
  const y = sinAcentos(b.toLowerCase());
  const t = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      t[i][j] = x[i] === y[j] && x[i] !== " " ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    }
  }
  const ea = new Array<boolean>(x.length).fill(false);
  const eb = new Array<boolean>(y.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j] && x[i] !== " ") {
      ea[i] = eb[j] = true;
      i++;
      j++;
    } else if (t[i + 1][j] >= t[i][j + 1]) i++;
    else j++;
  }
  return [ea, eb];
}

function Letras({ texto, iguales, desde }: { texto: string; iguales: boolean[]; desde: number }) {
  let inicio = 0;
  const palabras = texto.split(" ").map((p) => {
    const desdeAca = inicio;
    inicio += p.length + 1;
    return { p, desdeAca };
  });
  return (
    <span className="letras">
      {palabras.map(({ p, desdeAca }, k) => (
        <Fragment key={k}>
          {k > 0 ? " " : null}
          <span className="palabra">
            {p.split("").map((c, j) => (
              <span
                key={j}
                className={iguales[desdeAca + j] ? "letra" : "letra distinta"}
                style={{ "--i": desde + desdeAca + j } as CSSProperties}
              >
                {c}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

function FilaNivel({ n }: { n: (typeof NIVELES)[number] }) {
  const [ref, visto, anima] = useVisto<HTMLLIElement>();
  const [a, b] = alinear(n.tuya, n.publicada);
  return (
    <li ref={ref} className={["nivel", `n-${n.nivel}`, anima ? "anima" : "", visto ? "visto" : ""].join(" ")}>
      <PildoraNivel nivel={n.nivel} />
      <div className="nivel-par">
        <span className="nivel-rotulo">Tu marca</span>
        <Letras texto={n.tuya} iguales={a} desde={0} />
        <span className="nivel-rotulo">La solicitud</span>
        <Letras texto={n.publicada} iguales={b} desde={n.tuya.length} />
      </div>
      <p className="nivel-fundamento">{n.fundamento}</p>
    </li>
  );
}

export function Criterio() {
  return (
    <Seccion id="criterio" className="criterio">
      <div className="criterio-cabeza">
        <h2>Después del filtro, el criterio.</h2>
        <p className="bajada">
          Que dos denominaciones se parezcan no alcanza. Cada par que pasa el filtro lo lee un análisis armado con el
          criterio de un estudio de marcas: si una puede tomarse por la otra, si parece una línea o variante de la tuya, o
          si lo único que comparten es una palabra débil. Decide el nivel y deja escrito por qué.
        </p>
      </div>

      <ol className="niveles">
        {NIVELES.map((n) => (
          <FilaNivel key={n.nivel} n={n} />
        ))}
      </ol>
      <p className="criterio-cierre">
        En color, las letras que no comparten. Si lo único en común es un genérico del rubro, un lugar o una forma
        societaria, el par no llega al informe.
      </p>
    </Seccion>
  );
}
