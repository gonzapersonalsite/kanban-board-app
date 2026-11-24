---
title: Un diálogo abre con el foco en su campo, en una confirmación en la opción que no destruye, y si no en el botón de cerrar
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Al abrirse, un diálogo lleva el foco al control que su contenido marca: el
primer campo cuando es un formulario y la opción que no destruye nada cuando es
una confirmación. Si no marca ninguno, el foco queda donde lo pone el
navegador, en el botón de cerrar.** El diálogo de tarea abre en el título, el
de tablero en el nombre y la confirmación de borrar un tablero en «Cancelar»;
Ajustes y el diálogo de un día del calendario, que no son formularios, abren en
el botón de cerrar. El foco sigue volviendo a quien abrió el diálogo al
cerrarse.

**Cómo se marca.** El contenido pone `DIALOG_INITIAL_FOCUS` en el control
(`src/shared/ui/Dialog/initialFocus.ts`, exportado por `@/shared/ui`), y
`Dialog` lo enfoca justo después de `showModal()`
(`src/shared/ui/Dialog/Dialog.tsx`). El mecanismo vive una vez en el kit; cada
uso solo dice cuál es su control. Lo usan
`src/features/task-management/ui/TaskDialog.tsx`,
`src/features/board-management/ui/BoardEditorDialog.tsx` y
`src/features/board-management/ui/BoardDeleteDialog.tsx`.

Antes los dos campos llevaban `autoFocus` sin efecto: React no pone el atributo
en el documento, sino que enfoca el control al montarlo, cuando el diálogo
todavía está cerrado y nada dentro de él puede recibir el foco; después
`showModal()` enfocaba el primer elemento enfocable, el botón de cerrar. Lo vio
la entrega `#2026-11-24-design-guide-and-reader-conditions`.

Lo sujetan, en `Dialog.test.tsx`, el que pide el foco en el control marcado y el
que lo deja donde lo pone el navegador si no hay ninguno; y uno por uso:
`opens_with_the_focus_on_the_title_of_the_task` (`TaskDialog.test.tsx`),
`opens_with_the_focus_on_the_name_of_the_board` (`BoardEditorDialog.test.tsx`)
y `opens_the_delete_confirmation_with_the_focus_on_cancel`
(`BoardManagement.test.tsx`).

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

- **Evidencia en contra:** en un teléfono, el foco en un campo abre el teclado
  nada más aparecer el diálogo y tapa media pantalla, también cuando la persona
  solo quería mirar la tarea. Y el atributo `autofocus` de HTML, que el
  navegador respeta dentro de un `<dialog>`, haría lo mismo sin código propio.
- **Lo que se mantiene y por qué:** el diálogo de tarea y el de tablero se
  abren para escribir —crear o editar—, y quien usa el teclado se ahorra un
  tabulador; en una confirmación de borrado, Intro nada más abrir cancela en vez
  de borrar. React no deja llegar `autofocus` al documento, y por eso la marca
  es un atributo `data-` que el componente busca. Si el teclado que abre un
  teléfono molesta en la práctica, se mide en un teléfono de verdad y se decide
  con esa medida.
