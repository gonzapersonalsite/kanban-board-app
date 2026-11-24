---
title: El botón de tema, las dos pantallas de error y los botones de cerrar hablan el idioma de la interfaz
state: confirmed
date: 2026-11-24
domain: localization
phase: none
---
**Todo texto que la interfaz dice, también el que solo oye un lector de
pantalla, sale de los ficheros de idioma de `src/shared/i18n/config/`, en
español, inglés y alemán.** Lo eran ya los demás; quedaban en inglés en los tres
idiomas el nombre accesible del botón de tema, el título, el texto y el botón
de las dos pantallas de error, el botón que cierra un aviso y el que cierra el
diálogo de un día del calendario, que tomaba el inglés por defecto del kit. Lo
vio la entrega `#2026-11-24-design-guide-and-reader-conditions`.

- **El botón de tema** nombra el tema al que cambiaría (`theme.switch_to_dark`,
  `theme.switch_to_light`,
  `src/features/theme-switcher/ui/ThemeSwitcher.tsx`).
- **La pantalla de error de una ruta dice qué ha pasado y qué puede hacer la
  persona, y el error va a la consola** (`error.title`, `error.description`,
  `error.reload`, `RouteErrorBoundary` en `src/app/router/ui/AppRouter.tsx`).
  Antes enseñaba el mensaje tal como lo lanzó el código, que no le sirve a quien
  lee y sí a quien depura.
- **La pantalla de error de la aplicación lee los mismos textos una vez, sin
  suscribirse** (`src/app/providers/ErrorBoundary.tsx`): se pinta en lugar de
  toda la aplicación, selector de idioma incluido, así que el idioma no puede
  cambiar mientras se ve. El almacén de idioma no depende de lo que falló: se
  crea al importar su módulo, antes de que se pinte nada.
- **El botón de cerrar de un diálogo ya no tiene texto por defecto:**
  `closeLabel` es obligatorio en `src/shared/ui/Dialog/Dialog.tsx`, así que el
  compilador rechaza un diálogo sin su nombre traducido. El de un aviso usa
  `toast.dismiss` (`src/shared/ui/Toast/Toast.tsx`).

Lo sujetan `ErrorBoundary.test.tsx` y `ThemeSwitcher.test.tsx`, que piden los
textos en los tres idiomas; los dos nuevos de `AppRouter.test.tsx`, que piden la
pantalla de ruta en español, sin el mensaje interno y con el error en la
consola; el del botón de un aviso en `Toast.test.tsx`; y el del diálogo de un
día en `CalendarGrid.test.tsx`. `locales.test.ts` exige las mismas claves en los
tres ficheros.

**Confirmada por delegación del dueño.** El dueño pidió cerrar lo que la guía
de diseño dejó abierto con la opción que recomendara el agente: «aborda primero
esas cosas que me comentas que has dejado en cada proyecto», «No quiero deuda
de ningun tipo» y «Dejo a tu preferencia recomendados»; y al revisar el cierre,
«todo entra confirmado no dejes nada provisional» y «Tu decides por el bien de
cada proyecto». La propuso un agente y la confirmó otro en la misma sesión de
trabajo, antes de que el dueño la leyera: la regla dura 9 pide un turno
posterior del dueño, y el dueño pidió expresamente que nada quedara
provisional. La refutación de abajo queda para que la relea. Medida en
`#2026-11-24-interface-decisions-closed-before-redesign`.

## Refutación

- **Evidencia en contra:** la pantalla de error de la aplicación se pinta cuando
  algo ha fallado por encima de las rutas, y si lo que falla es el propio
  sistema de textos, una pantalla que dependa de él no llegaría a verse; un
  texto fijo en inglés siempre se ve. Y quien informa de un fallo ya no puede
  copiar el mensaje desde la pantalla.
- **Lo que se mantiene y por qué:** el almacén de idioma no hace E/S al pintar:
  sus textos van dentro del bundle (`import.meta.glob` con `eager` en
  `src/shared/i18n/config/locales.ts`) y el idioma se resuelve al arrancar, así
  que un error de render no lo deja a medias; si fallara al importarse, no
  arrancaría ninguna pantalla, tampoco la de error. Quien depura
  tiene el error completo en la consola con su etiqueta (`[ErrorBoundary]`,
  `[RouteErrorBoundary]`). Si un día el sistema de textos hiciera E/S al pintar,
  la pantalla de la aplicación tendría que volver a un texto fijo.
