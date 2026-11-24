---
title: Qué recibe el foco al abrir un diálogo con un campo está sin decidir
state: open
date: 2026-11-24
domain: interface
phase: none
---
**Qué recibe el foco al abrir un diálogo con un campo está sin decidir.** Hoy
lo recibe siempre el botón de cerrar, que es el primer elemento enfocable del
diálogo, también en los dos que piden otra cosa: el campo del título en
`src/features/task-management/ui/TaskDialog.tsx` y el del nombre en
`src/features/board-management/ui/BoardEditorDialog.tsx` llevan `autoFocus`, y
no tiene efecto. React lo aplica al montar el campo, cuando el diálogo todavía
no está abierto y nada dentro de él puede recibir el foco; después `showModal()`
enfoca el primer elemento enfocable. Lo vio la entrega
`#2026-11-24-design-guide-and-reader-conditions`.

**Qué hay que decidir.** Si un diálogo con un campo abre con el foco en ese
campo, como dice su código, o en el botón de cerrar, como ocurre. Enfocar el
campo ahorra un tabulador a quien va a escribir, y en una pantalla táctil abre
el teclado nada más aparecer el diálogo. Si se elige el campo,
`src/shared/ui/Dialog/Dialog.tsx` necesita una forma de saber cuál es, y los
dos `autoFocus` dejan de ser letra muerta; si se elige el botón, sobran.

**Por qué no tiene fase.** Las dos fases del plan del producto están hechas y
ninguna está abierta: es mantenimiento de la interfaz, y la fase que lo recoja
la abre el dueño. La guía de diseño lo lista en «Lo que sigue abierto».
