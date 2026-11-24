---
title: El texto sigue el tamaño de letra que eligió quien lee, y ninguna hoja lo da solo en píxeles
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**El texto sigue el tamaño de letra que cada persona eligió en su navegador:
la raíz no fija tamaño, la escala tipográfica son tokens en `rem` y ningún
tamaño de letra de una hoja de `src/` va solo en píxeles.** Un tamaño en
píxeles se queda en el que dio quien lo escribió aunque el lector agrande la
letra, y eso es lo que pide no hacer WCAG 1.4.4 (cambio de tamaño del texto).
Donde un suelo en píxeles tiene un porqué, va dentro de `max()` con un tamaño en
`rem`, de modo que nunca baja de él y crece con el lector: es el caso de los
16 píxeles de un campo bajo un dedo
(`#touch-floors-of-the-kit-do-not-reach-every-control`).

La escala está en `src/app/styles/global.css`. Lo sujeta
`does_give_no_font_size_only_in_pixels_so_the_text_follows_the_size_the_reader_chose`
en `tooling/styles/stylesheets.test.ts`, que lee todas las hojas de `src/`.
Corrigió los siete tamaños que iban en píxeles la entrega
`#2026-11-24-design-guide-and-reader-conditions`; los tamaños sueltos en `rem`
que no son de la escala esperan al rediseño
(`#choices-of-look-wait-for-the-visual-redesign`).

**Confirmada por delegación del dueño.** La propuso el agente que corrigió esos
tamaños, en el encargo «dejar correcto y final sin deudas y bien
implementado», y la registra otro con la delegación que dio el dueño al pedir
que se cerrara lo pendiente: «No quiero deuda de ningun tipo», «Dejo a tu
preferencia recomendados», «todo entra confirmado no dejes nada provisional» y
«Tu decides por el bien de cada proyecto». El dueño no la ha leído: la regla
dura 9 pide su confirmación en un turno posterior, y el dueño pidió
expresamente que nada quedara provisional. La refutación de abajo queda para
que la relea.

## Refutación

- **Evidencia en contra:** con la letra muy grande, una interfaz densa como un
  tablero de columnas pierde columnas a la vista, y un diseño en píxeles
  conserva la composición que se eligió.
- **Lo que se mantiene y por qué:** quien agranda la letra lo hace para leer,
  y una composición que no se lee no le sirve. El tablero ya recoloca sus
  columnas en las filas que hagan falta, y el calendario se desplaza dentro de
  su caja cuando no cabe
  (`#calendar-loses-a-day-column-on-a-narrow-screen-with-large-text`).
