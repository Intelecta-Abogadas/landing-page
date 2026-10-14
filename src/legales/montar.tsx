import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { Legal } from "../piezas";
import { PaginaLegal } from "./PaginaLegal";
import "../estilos.css";

export function montar(clave: Legal) {
  createRoot(document.getElementById("raiz")!).render(
    <StrictMode>
      <PaginaLegal clave={clave} />
    </StrictMode>,
  );
}
