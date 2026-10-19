# Monitor de Marcas · landing

React + Vite. El build arma cuatro páginas, cada una un único `index.html` autocontenido: la landing en `dist/`, los términos en `dist/terminos/`, la política de privacidad en `dist/privacidad/` y el buscador de marcas en `dist/buscar/`. Se abren con doble clic o se suben a cualquier hosting estático.

Lo publicado en `monitordemarcas.com.ar` sale de este repo: cada push a `main` corre las pruebas, arma `dist/` y lo publica en GitHub Pages (`.github/workflows/deploy-pages.yml`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | La levanta en modo desarrollo (`/terminos/`, `/privacidad/` y `/buscar/` incluidas). Para que el buscador le pregunte a la aplicación de esta máquina: `VITE_API_BUSCADOR=http://localhost:3000 npm run dev` |
| `npm run build` | Chequea tipos y arma las cuatro páginas, una pasada por página |
| `npm test` | El filtro del navegador contra el backend (681 casos), el texto legal (11) y el buscador (11), 703 en total |
| `npm run datos` | Regenera `src/cotejo/datos.ts` y `src/cotejo/casos.json` desde `../marcas-app-backend` |
| `npm run legales "<docx>"` | Regenera `src/legales/documentos.json` desde el Word del estudio |

## El cotejo

`src/cotejo/` es el filtro previo del backend (`marcas_service/scoring`, versión `multi_v8`) portado a TypeScript: normalización, las cuatro dimensiones, las palabras vacías y las genéricas del corpus. Las pruebas comparan cada clave fonética y cada puntaje contra lo que contesta el Python original; además se barrió contra 39.006 palabras y 20.000 pares de denominaciones reales, con diferencia menor a una millonésima.

Si el backend cambia de versión, `npm run datos` y `npm test`.

## Términos y política de privacidad

El texto lo redactó el estudio y va **tal cual**: mayúsculas, acentos, negritas, listas y puntuación como vienen en el Word. Las únicas transformaciones, pedidas por el dueño: el formato de los CUIT, que se escriben `20-38759781-7` (el número no se corrige: si el dígito verificador no cierra, se publica como vino), y sin punto después de un CUIT que cierra el renglón.

- `scripts/generar_legales.py` lee el `.docx` (Título 1 abre un documento, Título 2 en negrita con «N. » abre una cláusula; lo anterior a la primera cláusula es el encabezado) y escribe `src/legales/documentos.json`. Corta con error si encuentra un formato que no sabe reproducir (cursiva, subrayado fuera de la dirección del sitio, tachado, tabulaciones o saltos de línea dentro de un párrafo), si no hay dos documentos o si las cláusulas no van de 1 a N.
- Cuando el estudio mande una versión nueva: `npm run legales "<ruta al docx>"`, `npm test` y `npm run build`. Las pruebas fijan los títulos, la cantidad de cláusulas (27 y 21), la fecha de la última actualización y los CUIT; si el estudio cambia alguno de esos datos, se ajusta la prueba.
- `src/legales/PaginaLegal.tsx` dibuja cada documento con la cabecera y el pie de la landing; el texto ocupa todo el ancho del marco, de margen a margen, sin índice ni columnas al costado. Al imprimir sale sólo el texto.
- La dirección del sitio, el correo y el teléfono se enlazan al dibujar, y los CUIT y el teléfono no se cortan entre dos renglones (`tramos` en `src/legales/documentos.ts`); el texto no cambia una letra.
- El pie de las tres páginas lleva, en una línea propia debajo, «Términos y condiciones» y «Política de privacidad» (`LEGALES` en `src/piezas.tsx`).

Cada página vive en su carpeta (`terminos/index.html`, `privacidad/index.html`, `buscar/index.html`) y se arma en su propia pasada (`vite build --mode terminos` / `--mode privacidad` / `--mode buscar`), porque `vite-plugin-singlefile` mete todo en un archivo por pasada. La de la landing vacía `dist/`; las otras tres se agregan al lado.

Los enlaces entre páginas son relativos (`terminos/`, `../#cotejo`). Abiertas desde el disco no hay servidor que resuelva una carpeta a su `index.html`, así que ahí `enlaceInterno` (`src/piezas.tsx`) nombra el archivo; publicadas, apuntan a la carpeta.

## El buscador de marcas

`buscar/` es el buscador para el público, como el de Zop: se escribe una marca, se eligen las clases y aparecen las marcas en trámite y concedidas del INPI que se escriben o suenan como ella, agrupadas de la más cercana a la más lejana. Cada fila abre la ficha de la marca, con los productos, los titulares, el logo y el plazo de oposición. Lo decidió el dueño el 19/10/2026.

- **La búsqueda no corre acá.** La página sólo le pregunta a la aplicación (`https://app.monitordemarcas.com.ar/api/publico/*`, en `marcas-app-ui/server/publico/`), que consulta el servicio web del INPI y TMview y puntúa con el filtro previo, sin IA. Los pedidos llevan `credentials: "include"`: la aplicación cuenta las búsquedas con una cookie propia. La arquitectura está en `marcas-app-ui/docs/ARQUITECTURA.md` §12.
- **3 búsquedas sin datos y 5 por día durante 3 meses con los datos.** Los datos son nombre y apellido, correo y WhatsApp con su país; el correo se confirma con un código de 6 números. No hay cuenta ni contraseña. Pasado el plazo, «Solicitar demo». La línea bajo el buscador muestra lo que queda, una marca por búsqueda.
- **Ventana privada.** `src/buscador/privado.ts` la detecta (la cuota del almacenamiento en Chrome, los service workers en Firefox, el sistema de archivos privado en Safari) y lo manda con la búsqueda: ahí la aplicación pide los datos desde la primera. Si ninguna señal contesta, cuenta como ventana normal.
- **Los tipos de las respuestas** están en `src/buscador/tipos.ts` y en `server/publico/` de la aplicación: cambian juntos. Los textos de cada respuesta (que el INPI no contesta, que el código venció) son de la página (`textoDeFalla` en `src/buscador/textos.ts`); un código nuevo muestra la frase de la aplicación.
- **Los nombres sin mayúsculas.** El INPI escribe todo en mayúsculas; la página muestra los nombres con mayúscula inicial y los productos como oración (`nombreVisible` y `oracion`), como la aplicación.
- **Se publica después de la aplicación.** Publicada antes, cada búsqueda contesta que no pudo conectarse.
- La cabecera y el pie llevan «Buscar marcas», y la portada el botón «Buscar una marca» en el lugar que tenía «Ver cómo trabaja», a pedido del dueño (19/10/2026): en el celular el menú de la cabecera no se ve, y esa sección es la que sigue a la portada (`BUSCADOR` en `src/piezas.tsx`).

## Lo que la página toma de la realidad

- Las fechas (próximo boletín, plazo de oposición, cuenta regresiva al informe) se calculan en hora argentina con el calendario del sistema: boletín los Miércoles, informe los Jueves a las 8:00 (`jobs/boot.ts` de la app).
- «Entre 2.300 y 5.000 solicitudes por semana»: los Boletines de Marcas Nuevas de Junio a Septiembre de 2026.
- El correo de «Avisar al cliente» reproduce el que arma la app (`server/email/alert-client-notice.ts`).
- «Solicitar demo» (cabecera, cierre y pie) abre en otra pestaña el formulario de Google del estudio, el mismo del ingreso de la app (`URL_SOLICITAR_DEMO` en `components/monitor/acceso.tsx`): cambian juntos. «Ingresar» e «Ingresar al sistema» llevan a `https://app.monitordemarcas.com.ar`. Las dos direcciones están en `src/piezas.tsx`.
- Marcas, actas, titulares y clientes de los ejemplos son inventados.
