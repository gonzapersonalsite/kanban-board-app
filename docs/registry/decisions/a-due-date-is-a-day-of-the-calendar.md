---
title: Una fecha de vencimiento es un día del calendario escrito AAAA-MM-DD, y lo que no lo es no entra
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Una fecha de vencimiento es un día que existe, escrito `AAAA-MM-DD` con un año
de cuatro cifras, o no hay fecha.** Es lo que da un campo de fecha del
navegador, y las pantallas que la formatean —la tarjeta, el calendario, el
diálogo de un día— cuentan con ello sin comprobarlo. El criterio vive una vez,
en `isCalendarDay` (`src/shared/api/dueDate.ts`): una cadena con esa forma cuyo
día no se pasa al mes siguiente, de modo que el 30 de febrero no entra.

**Por qué.** El campo de fecha deja escribir un año de cinco cifras. El
almacén lo guardaba, el tablero dejaba de pintarse con `Invalid time value` y
cada recarga volvía a la pantalla de error, porque la fecha quedaba guardada.
Una copia de seguridad con una fecha que no fuera un día hacía lo mismo al
importarse.

**Dónde se cierra, en cada entrada:**

- **El campo** no ofrece un día más allá del último del año 9999 (su
  atributo `max`, en `src/features/task-management/ui/TaskDialog.tsx`).
- **El almacén** rechaza la tarea o el cambio que traiga otra cosa y lo dice con
  un aviso, `validation.invalid_due_date`, en los tres idiomas
  (`src/shared/api/slices/taskSlice.ts`).
- **La importación** rechaza la copia entera con `KanbanRestoreError`
  (`src/shared/api/restore.ts`), sin importarla a medias, y Ajustes dice que la
  copia no es válida (`data_portability.import_error_invalid_snapshot`).
- **Lo ya guardado** pasa por la migración a la versión 2 del almacén
  (`KANBAN_STORAGE_VERSION`, `migrateKanbanState` en
  `src/shared/api/store.ts`): la tarea se queda y la fecha que ninguna pantalla
  puede mostrar se va. Es el único dato que se pierde, y mientras estaba, el
  tablero no se abría.

Lo sujetan `dueDate.test.ts`, con los días que entran y los que no; los tres
nuevos de `taskSlice.test.ts`, que piden que no entre una tarea ni un cambio con
una fecha que no sea un día, y que lo diga; los de `restore.test.ts`, con seis
formas de fecha que rechazan la copia; los dos de `store.test.ts`, en los que un
tablero guardado con una fecha así se abre y su tarea se queda sin ella; y
`takes_no_due_date_with_a_year_longer_than_the_screens_can_show` en
`TaskDialog.test.tsx`.

**Confirmada por delegación del dueño.** La encontró y la cerró el agente al
repetir el recorrido de la interfaz que el dueño encargó con estas palabras:
«aborda primero esas cosas que me comentas que has dejado en cada proyecto»,
«No quiero deuda de ningun tipo» y «Dejo a tu preferencia recomendados»; y al
revisar el cierre, «todo entra confirmado no dejes nada provisional» y «Tu
decides por el bien de cada proyecto». La propuso un agente y la confirmó otro
en la misma sesión de trabajo, antes de que el dueño la leyera: la regla dura 9
pide un turno posterior del dueño, y el dueño pidió expresamente que nada
quedara provisional. La refutación de abajo queda para que la relea. Medida en
`#2026-11-24-interface-decisions-closed-before-redesign`.

## Refutación

- **Evidencia en contra:** la migración cambia datos que la persona guardó, y
  la skill del proyecto pide no reescribir datos persistidos; una fecha rara
  podría ser intencionada, y borrarla la pierde. Rechazar una copia entera por
  una fecha es más duro que importarla sin esa fecha.
- **Lo que se mantiene y por qué:** la regla de la skill es la del tablero de
  ejemplo, que no se relocaliza una vez tocado; una migración de esquema es otra
  cosa y es la vía que `persist` da para ello. La fecha que se borra es la que
  impedía abrir el tablero entero, en cada recarga, sin que la persona pudiera
  corregirla desde la interfaz; con ella fuera, la tarea, su título y su
  descripción siguen ahí. La importación rechaza la copia sin tocar nada de lo
  que ya había: una importación a medias dejaría a la persona sin saber qué
  entró.
