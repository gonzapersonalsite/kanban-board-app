---
title: Nada se mueve para quien pidió menos movimiento
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Toda animación, toda transición de algo que se desplaza o cambia de tamaño y
todo desplazamiento bajo el puntero van dentro de
`@media (prefers-reduced-motion: no-preference)`.** Fuera de ese bloque solo
cambian colores, opacidades y sombras, que dicen un estado sin mover nada. Lo
que no se mueve se ve igual para todos: la columna activa del 404 y la zona
donde se suelta una tarjeta siguen cambiando de borde y de fondo, y solo se
levantan o crecen para quien no pidió menos movimiento.

Cubre los fundidos de entrada de tarjetas y columnas
(`src/entities/task/ui/TaskCard.module.css`,
`src/entities/column/ui/ColumnShell.module.css`), el desplazamiento de una
tarjeta o del botón principal al pasar el ratón y al pulsar
(`src/shared/ui/Button/Button.module.css`), la tarjeta que se arrastra
(`src/features/drag-and-drop/ui/DraggableTaskCard.module.css`), el aviso que
entra deslizándose (`src/shared/ui/Toast/Toast.module.css`) y la página 404
(`src/pages/not-found/ui/NotFoundPage.module.css`). El esqueleto de carga ya lo
respetaba (`src/app/router/ui/AppShellRoute.module.css`).

**Por qué en ese sentido.** El bloque añade el movimiento a quien no ha pedido
lo contrario, en vez de quitárselo a quien lo pidió: una regla nueva escrita
fuera del bloque no se mueve para nadie hasta que alguien decide que se mueva.

Lo sujeta `does_keep_every_animation_and_every_movement_for_the_reader_who_did_not_ask_for_less_motion`
en `tooling/styles/stylesheets.test.ts`, que lee todas las hojas de `src/` y
lista lo que se mueve fuera del bloque; el test que lo precede comprueba ese
detector con un ejemplo de cada caso.

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

- **Evidencia en contra:** los fundidos de entrada solo cambian la opacidad, y
  un fundido no desplaza nada; quitárselos a quien pidió menos movimiento le
  quita también la pista de que algo acaba de aparecer.
- **Lo que se mantiene y por qué:** un fundido de 0,3 segundos en cada tarjeta
  al cargar el tablero es movimiento de toda la pantalla a la vez, que es lo
  que esa preferencia pide evitar; y lo que aparece lo dice el tablero mismo,
  sin animación. Un test que distinguiera los fundidos de los desplazamientos
  pediría leer cada `@keyframes`; una regla sin excepciones se comprueba
  leyendo solo dónde está escrita.
