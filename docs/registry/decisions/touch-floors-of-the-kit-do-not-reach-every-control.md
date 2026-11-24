---
title: Todo control mide al menos 24 píxeles, y 44 bajo un dedo, salvo las tareas de un día del calendario
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Todo control mide al menos 24 por 24 píxeles CSS, el mínimo de WCAG 2.2 AA
(2.5.8), y bajo un puntero táctil al menos 44 por 44, el que piden WCAG 2.5.5 y
las guías de Apple. Bajo un dedo, además, ningún campo baja de 16 píxeles de
letra, para que Safari en iOS no amplíe la página al enfocarlo.** Los suelos se
dicen una vez, en `src/app/styles/global.css`, y no control a control:

- **El suelo de cada control** es una regla sobre los enlaces, botones, campos,
  selectores, áreas de texto, `summary` y `[role='button']`, con
  `min-block-size` y `min-inline-size` iguales a `--pointer-target-min`: 24
  píxeles (`--target-size-min`), y 44 (`--touch-target-min`) bajo
  `@media (pointer: coarse)`. Va dentro de `:where()`, que la deja sin peso: un
  componente que da a su control un mínimo mayor lo conserva.
- **Bajo un dedo, los tamaños del kit toman el mayor**: `--control-size-sm` y
  `--control-size-md` pasan a valer lo que `--control-size-lg`, y por eso los
  botones del kit dejan de repetir esa regla en su propia hoja.
- **La letra de los campos** bajo un dedo es `max(16px, 1rem)` con
  `!important`: un tamaño de letra no tiene suelo propio y cada campo pone el
  suyo, ninguno mayor que `1rem`, así que el suelo tiene que ganarles a todos.

**La excepción, escrita en su hoja:** las tareas de un día del mes y su
recuento se quedan en el suelo de 24 también bajo un dedo
(`src/widgets/calendar/ui/CalendarGrid.module.css`): a 44 no caben dos tareas y
su recuento en una celda, y el diálogo del día, que se abre desde el recuento,
las enseña todas a tamaño completo.

**Qué cambia a la vista.** Con ratón, las tareas del calendario y su recuento
pasan de 15 a 24 píxeles de alto, y los enlaces de los créditos de 22,5 a 24.
Bajo un dedo, a 390 píxeles: los enlaces de navegación de la cabecera pasan de
40 a 44 de alto, los dos selectores y el campo para renombrar una columna de
36 o 40 a 44, el campo de fichero de 24 a 44, los enlaces de los créditos de 21
a 44, el botón «Hoy» y los de mes del calendario de 29 y 32 a 44, y las tareas
del diálogo de un día de 35 a 44; los dos selectores y el campo para renombrar
una columna pasan a 16 píxeles de letra. Donde el control ya medía más, no
cambia nada.

**Lo que no se sabe.** Si Safari amplía de verdad la página con algún campo:
no hay un iPhone a mano, y se leyó el tamaño calculado.

Lo sujetan cuatro tests de `tooling/styles/stylesheets.test.ts`: la regla sin
peso con su lista de controles, los valores de los suelos dentro y fuera de
`pointer: coarse`, que solo la hoja del calendario baje del suelo táctil, y los
16 píxeles de los campos bajo un dedo.

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

- **Evidencia en contra:** subir los controles cambia lo que se ve en un
  teléfono, que es justo lo que el rediseño anunciado va a estudiar; una regla
  global con `:where()` alcanza también controles que nadie ha mirado, y un
  `!important` en la letra de los campos le quita a un componente la última
  palabra.
- **Lo que se mantiene y por qué:** el mínimo de 24 es del nivel AA, no una
  elección de aspecto, y las tareas del calendario a 15 píxeles, apiladas a 1
  de distancia, no lo cumplían. Que la regla alcance a todo control es lo que
  se busca: el que nadie ha mirado es el que se quedaba corto. Un componente
  conserva su tamaño mayor porque la regla no pesa, y el `!important` solo
  vive bajo un dedo y solo sube la letra hasta 16. El rediseño puede cambiar
  todo lo demás siempre que mantenga los suelos.
