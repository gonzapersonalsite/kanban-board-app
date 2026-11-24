---
title: Las elecciones de aspecto esperan al rediseño visual
state: postponed
date: 2026-11-24
domain: interface
phase: none
---
**Lo que es puramente aspecto espera al rediseño visual que el dueño anunció
estudiar con él.** Las correcciones de la interfaz se cerraron con el mínimo
cambio de aspecto (`#2026-11-24-interface-decisions-closed-before-redesign`),
y esto queda como está, a la vista y sin un registro que diga por qué es así:

- **La paleta, la tipografía y el efecto cristal:** índigo sobre neutros, Inter
  y Plus Jakarta Sans, y tarjetas y cabecera translúcidas
  (`src/app/styles/global.css`, `src/widgets/header/ui/Header.module.css`).
  Está por decir si son una decisión de marca o el aspecto con el que nació el
  producto, y qué habría que conservar al cambiarlos.
- **Los valores que no tienen un token del mismo valor.** Pasaron a su token
  los que ya tenían uno con el mismo valor calculado en claro: los radios de 4,
  6 y 8 píxeles, el rojo de error y el fondo del resumen de una importación,
  que en oscuro toman ahora su par del tema. Los demás se quedan escritos en su
  hoja, porque llevarlos a un token cambia lo que se ve: 31 tamaños de letra en
  `rem` que no son de la escala, que es fluida y no coincide con ninguno; los
  colores escritos a mano en 13 hojas, de estado, de acento, de degradado y de
  sombra; y
  los radios de 2, 10, 12 y 999 píxeles y el círculo del día de hoy. Inventar
  una escala para ellos es parte del rediseño, no de una corrección.
- **El grosor de los indicadores de foco.** Cada control tiene uno que cumple
  WCAG 2.2 AA: el contorno de dos píxeles del token del foco, el del navegador
  o, en los campos, el borde de un píxel que cambia al color del foco (6,29:1
  contra el campo y su entorno en claro, 4,99:1 en oscuro). El borde de un
  píxel no llega a los dos de grosor que pide el nivel AAA; engrosarlo es
  cambiar el aspecto de todos los campos.

**El disparador** es que el dueño abra el rediseño visual. La fase es `none`
porque el rediseño no pertenece a ninguna fase del plan del producto, y abrirá
la suya cuando el dueño lo decida. Aplazada por indicación del dueño, que
anunció ese rediseño al pedir que se cerraran antes las decisiones abiertas de
la interfaz.
