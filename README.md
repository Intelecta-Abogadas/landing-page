# Monitor de Marcas · landing

React + Vite. El build es un único `dist/index.html` (más el ícono) que se abre con doble clic o se sube a cualquier hosting estático.

Lo publicado en `monitordemarcas.com.ar` sale de este repo: cada push a `main` corre las pruebas, arma `dist/` y lo publica en GitHub Pages (`.github/workflows/deploy-pages.yml`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | La levanta en modo desarrollo |
| `npm run build` | Chequea tipos y arma `dist/index.html` |
| `npm test` | Compara el filtro del navegador contra el backend (681 casos) |
| `npm run datos` | Regenera `src/cotejo/datos.ts` y `src/cotejo/casos.json` desde `../marcas-app-backend` |

## El cotejo

`src/cotejo/` es el filtro previo del backend (`marcas_service/scoring`, versión `multi_v8`) portado a TypeScript: normalización, las cuatro dimensiones, las palabras vacías y las genéricas del corpus. Las pruebas comparan cada clave fonética y cada puntaje contra lo que contesta el Python original; además se barrió contra 39.006 palabras y 20.000 pares de denominaciones reales, con diferencia menor a una millonésima.

Si el backend cambia de versión, `npm run datos` y `npm test`.

## Lo que la página toma de la realidad

- Las fechas (próximo boletín, plazo de oposición, cuenta regresiva al informe) se calculan en hora argentina con el calendario del sistema: boletín los Miércoles, informe los Jueves a las 8:00 (`jobs/boot.ts` de la app).
- «Entre 2.300 y 5.000 solicitudes por semana»: los Boletines de Marcas Nuevas de Junio a Septiembre de 2026.
- El correo de «Avisar al cliente» reproduce el que arma la app (`server/email/alert-client-notice.ts`).
- «Solicitar demo» (cabecera, cierre y pie) abre en otra pestaña el formulario de Google del estudio, el mismo del ingreso de la app (`URL_SOLICITAR_DEMO` en `components/monitor/acceso.tsx`): cambian juntos. «Ingresar» e «Ingresar al sistema» llevan a `https://app.monitordemarcas.com.ar`. Las dos direcciones están en `src/piezas.tsx`.
- Marcas, actas, titulares y clientes de los ejemplos son inventados.
