---
title: El calendario pierde la columna del domingo en una pantalla estrecha con la letra grande
state: open
date: 2026-11-24
domain: interface
phase: none
---
**El calendario pierde la columna del domingo en una pantalla estrecha con la
letra grande, y está sin decidir cómo se recoloca.** A 320 píxeles CSS de ancho
y con el tamaño de letra por defecto del navegador en 24 píxeles, la rejilla
del mes mide más que su caja, que recorta lo que sobra: la séptima columna
queda fuera y no hay desplazamiento que la traiga. Con una sola de las dos
condiciones no ocurre: a 320 píxeles con la letra por defecto y a 1280 con la
letra en 24 píxeles se ven los siete días. Lo midió la entrega
`#2026-11-24-design-guide-and-reader-conditions`.

**Qué hay que decidir.** Cómo cede el calendario cuando no cabe: nombres de
día más cortos, una rejilla que se desplaza dentro de su caja, o columnas que
encogen recortando el nombre del día. Las tres cambian lo que se ve, y por eso
no se eligió ninguna al medirlo. La rejilla está en
`src/widgets/calendar/ui/CalendarGrid.module.css`.

**Por qué no tiene fase.** Las dos fases del plan del producto están hechas y
ninguna está abierta: es mantenimiento de la interfaz, y la fase que lo recoja
la abre el dueño. La guía de diseño lo lista en «Lo que sigue abierto».
