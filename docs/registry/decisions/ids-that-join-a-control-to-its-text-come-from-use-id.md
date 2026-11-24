---
title: Los ids que unen un control con su etiqueta, su error o su descripción salen de useId()
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Un id que une un control con su etiqueta, su error, su descripción o el
título que lo nombra sale de `useId()`, o del id de la entidad que lo hace
único, como el de la columna en el alta de tarea.** Con un id fijo, dos
instancias en la misma página comparten el id, y la segunda se queda sin
etiqueta o sin error para un lector de pantalla. Quedan fijos tres que son
únicos por página a propósito: los títulos de los créditos de Ajustes y de la
404 y las instrucciones de arrastre que comparten todas las tarjetas y
columnas.

Lo siguen los formularios (`src/entities/board/ui/BoardSelector.tsx`,
`src/features/board-management/ui/BoardEditorDialog.tsx`,
`src/features/column-management/ui/AddColumnForm.tsx`,
`src/features/data-portability/ui/DataImportSection.tsx`), el título que nombra
cada diálogo (`src/shared/ui/Dialog/Dialog.tsx`) y, en el calendario, el mes
que nombra la rejilla y el día que describe cada tarea
(`src/widgets/calendar/ui/CalendarGrid.tsx`). Lo sujetan los tests que montan
dos instancias en la misma página: los dos de etiqueta
(`BoardSelector.test.tsx`, `DataImportSection.test.tsx`), los dos de error
(`AddColumnForm.test.tsx`, `BoardEditorDialog.test.tsx`) y
`names_each_dialog_by_its_own_title_when_two_dialogs_share_a_page`
(`Dialog.test.tsx`).

**Confirmada por delegación del dueño.** La propuso el agente que corrigió los
ids fijos (`#2026-11-24-design-guide-and-reader-conditions`), en el encargo
«dejar correcto y final sin deudas y bien implementado», y la registra otro con
la delegación que dio el dueño al pedir que se cerrara lo pendiente: «No quiero
deuda de ningun tipo», «Dejo a tu preferencia recomendados», «todo entra
confirmado no dejes nada provisional» y «Tu decides por el bien de cada
proyecto». El dueño no la ha leído: la regla dura 9 pide su confirmación en un
turno posterior, y el dueño pidió expresamente que nada quedara provisional. La
refutación de abajo queda para que la relea.

## Refutación

- **Evidencia en contra:** hoy casi ningún control aparece dos veces en la
  misma página, y un id fijo se lee mejor en el HTML y en un test.
- **Lo que se mantiene y por qué:** un mismo formulario ya se pinta varias
  veces —el alta de tarea va en cada columna—, y el día que otro se repita
  nadie lo notará: el fallo es silencioso para quien ve la página y solo lo
  oye un lector de pantalla. Los tests buscan los controles por su papel y su
  nombre, no por su id.
