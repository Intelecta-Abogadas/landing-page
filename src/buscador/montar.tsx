import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buscador } from "./Buscador";
import "../estilos.css";

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <Buscador />
  </StrictMode>,
);
