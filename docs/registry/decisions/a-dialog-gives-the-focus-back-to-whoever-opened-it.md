---
title: Un diálogo devuelve el foco a quien lo abrió, se cierre como se cierre
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Al cerrarse, un diálogo devuelve el foco al elemento que lo tenía al abrirse,
se cierre con Escape, con el aspa o con cualquiera de sus botones, y se quede en
el documento o lo quite su dueño.** Quien usa el teclado sigue donde estaba; sin
esto, el foco caía en `<body>` y el siguiente tabulador empezaba la página desde
arriba.

Lo hace el componente y no el navegador (`src/shared/ui/Dialog/Dialog.tsx`):
guarda el elemento enfocado justo antes de `showModal()` y se lo devuelve al
cerrarse. El navegador solo devuelve el foco cuando un diálogo modal se cierra,
y casi todos los consumidores lo quitan del documento al cerrar. Por la misma
razón `src/shared/ui/Dialog/Dialog.module.css` da su `display` al diálogo solo
cuando está abierto: con él puesto siempre, el diálogo se veía un instante antes
de abrirse y el elemento guardado no era el que lo abrió.

Lo sujetan `returns_the_focus_to_its_opener_when_its_owner_unmounts_it` y
`returns_the_focus_to_its_opener_when_its_owner_keeps_it_mounted_and_closes_it`
en `Dialog.test.tsx`. Qué recibe el foco al abrirse lo dice
`#which-element-takes-the-focus-when-a-dialog-opens`.

**Confirmada por delegación del dueño.** La propuso el agente que lo corrigió
(`#2026-11-24-design-guide-and-reader-conditions`), en el encargo «dejar
correcto y final sin deudas y bien implementado», y la registra otro con la
delegación que dio el dueño al pedir que se cerrara lo pendiente: «No quiero
deuda de ningun tipo», «Dejo a tu preferencia recomendados», «todo entra
confirmado no dejes nada provisional» y «Tu decides por el bien de cada
proyecto». El dueño no la ha leído: la regla dura 9 pide su confirmación en un
turno posterior, y el dueño pidió expresamente que nada quedara provisional. La
refutación de abajo queda para que la relea.

## Refutación

- **Evidencia en contra:** si el elemento que abrió el diálogo ya no existe al
  cerrarse —borrar el tablero desde su propia confirmación, por ejemplo—, no hay
  adónde devolver el foco, y un diálogo que lo devuelve solo hace algo que el
  navegador haría si nadie quitara el diálogo del documento.
- **Lo que se mantiene y por qué:** si el elemento ya no está, el foco queda
  donde lo deje el navegador, como antes, sin error; en los demás casos, que
  son casi todos, vuelve a su sitio. Que lo haga el componente deja a cada
  consumidor libre de quitar el diálogo del documento al cerrarlo.
