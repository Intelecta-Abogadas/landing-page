import type { CSSProperties } from "react";
import { textoDelCupo } from "./textos";
import type { EstadoDelCupo } from "./tipos";

/** One mark per search of the allowance: the used ones empty out as they are spent. */
export function Cupo({ estado }: { estado: EstadoDelCupo | null }) {
  if (!estado) return <p className="cupo cupo-vacio" aria-hidden="true" />;
  const marcas = Array.from({ length: estado.cupo }, (_, i) => i < estado.restantes);
  return (
    <p className="cupo" aria-live="polite">
      <span className="cupo-marcas" aria-hidden="true">
        {marcas.map((queda, i) => (
          <i key={i} className={queda ? "queda" : undefined} style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
      <span>{textoDelCupo(estado)}</span>
    </p>
  );
}
