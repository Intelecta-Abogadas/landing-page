import { Alerta } from "./secciones/Alerta";
import { Cabecera } from "./secciones/Cabecera";
import { Cartera } from "./secciones/Cartera";
import { Cierre } from "./secciones/Cierre";
import { Cotejo } from "./secciones/Cotejo";
import { Criterio } from "./secciones/Criterio";
import { Embudo } from "./secciones/Embudo";
import { Pie } from "./secciones/Pie";
import { Portada } from "./secciones/Portada";

export function App() {
  return (
    <>
      <Cabecera />
      <main>
        <Portada />
        <Embudo />
        <Cotejo />
        <Criterio />
        <Alerta />
        <Cartera />
        <Cierre />
      </main>
      <Pie />
    </>
  );
}
