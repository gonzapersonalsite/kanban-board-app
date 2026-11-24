---
title: El mes del calendario no encoge por debajo de su contenido, y se desplaza dentro de su caja cuando no cabe
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**La rejilla del mes no encoge por debajo de su contenido. Cuando sus siete
días son más anchos que la pantalla, se desplaza de lado dentro de su propia
caja; cuando el mes es más alto, se desplaza el calendario.** El documento no
se desplaza de lado en ningún caso, y los nombres de los días no se acortan ni
se recortan. La caja es una región con el nombre del mes, que el tabulador
alcanza y las flechas desplazan, así que quien usa el teclado llega al domingo
sin ratón (`src/widgets/calendar/ui/CalendarGrid.tsx`,
`src/widgets/calendar/ui/CalendarGrid.module.css`).

**Por qué.** La rejilla medía lo que le daba la pantalla y recortaba lo que
sobraba, sin desplazamiento que lo trajera. A 320 píxeles con la letra en 24 se
perdía la columna del domingo, y en más condiciones de las que se habían visto
se perdían las últimas filas: 6 píxeles a 1280 por 800, 48 con la letra en 24,
212 a 320 píxeles, 306 en una ventana de 1280 por 500 y 358 con el zoom al
200 %. Las otras dos salidas que se consideraron cambian lo que se ve donde ya
cabía: nombres de día más cortos, o columnas que encogen recortando su
contenido. Lo midió la entrega `#2026-11-24-design-guide-and-reader-conditions`
y las cifras de después están en
`#2026-11-24-interface-decisions-closed-before-redesign`.

**Qué cambia a la vista.** Donde todo cabía, nada. Donde no, la rejilla
conserva su alto natural y el calendario se desplaza: a 1280 por 800, con un
día que tiene más tareas de las que enseña, el mes mide 27 píxeles más que su
hueco y aparece la barra de desplazamiento del calendario; y a 320 píxeles con
la letra en 24, la rejilla mide 360 píxeles en una caja de 278 que se desplaza
de lado.

Lo sujeta `holds_its_seven_days_in_a_region_named_by_the_month_that_the_keyboard_reaches`
en `CalendarGrid.test.tsx`. Que la rejilla no encoja es CSS que el entorno de
los tests no aplica: se mide en el navegador.

**Confirmada por delegación del dueño.** El dueño pidió cerrar lo que la guía
de diseño dejó abierto con la opción que recomendara el agente: «aborda primero
esas cosas que me comentas que has dejado en cada proyecto», «No quiero deuda
de ningun tipo» y «Dejo a tu preferencia recomendados»; y al revisar el cierre,
«todo entra confirmado no dejes nada provisional» y «Tu decides por el bien de
cada proyecto». La propuso un agente y la confirmó otro en la misma sesión de
trabajo, antes de que el dueño la leyera: la regla dura 9 pide un turno
posterior del dueño, y el dueño pidió expresamente que nada quedara
provisional. La refutación de abajo queda para que la relea.

## Refutación

- **Evidencia en contra:** un calendario que se desplaza de lado esconde los
  últimos días de la semana hasta que la persona desplaza, y en un escritorio
  normal aparece ahora una barra de desplazamiento que antes no estaba.
- **Lo que se mantiene y por qué:** antes esos días y esas filas no se veían
  nunca; ahora se ven desplazando, con el ratón, el dedo o el teclado. La barra
  del escritorio aparece porque el mes es más alto que su hueco, y antes eso
  mismo se resolvía cortando la última fila. Acortar los nombres de los días
  cambiaría lo que se ve en todas las pantallas, también donde cabían, y con
  una letra aún mayor volvería a no caber; el desplazamiento solo aparece
  cuando hace falta.
