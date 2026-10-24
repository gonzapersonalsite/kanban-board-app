---
title: La autoría vive en Ajustes y en el footer de la 404, no en el tablero
state: provisional
date: 2026-10-24
phase: none
---
**La autoría vive en el bloque de créditos de Ajustes y en el footer de la
página 404; el tablero y el calendario no llevan un footer persistente.** El
dueño eligió esta opción entre las que le puso el agente y pidió estudiarla al
tocar el proyecto; no la dictó. La implementación mantiene intacta la altura de
trabajo del tablero.

**Forma.**

- El diálogo de Ajustes cierra con una sección `Credits`: nombre, rol, una línea
  sobre el tablero local y enlaces al portafolio, GitHub y el correo personal.
- La página 404, que sí tiene un final de documento, cierra con un `<footer>`
  real que usa el mismo componente `Credits`.
- El contacto es el Gmail personal (`gonzalomartinezg2001@gmail.com`), no
  `support@gonzaloapps.es`: Kanban es una app de currículum y evaluación, no una
  app comercial. Lo decidió el dueño al separar los dos canales.
- El componente vive en `src/shared/ui/Credits/` porque lo usan el widget del
  header y la página 404; no sabe nada del store ni de las rutas. No añade
  dependencias.
- Las cadenas nuevas están en los tres idiomas (`es`, `en`, `de`) y la paridad
  de claves las comprueba `locales.test.ts`.
- No abre fase: es una parte de presentación que no cambia el modelo, el
  drag-and-drop ni las rutas. Cae fuera de F1, ya cerrada.

## Refutación

- **Evidencia en contra:** una barra de estado persistente daría más presencia
  y se vería siempre; un footer al final del tablero también, y un enlace
  `Créditos` en la cabecera sería más visible que Ajustes.
- **Lo que se mantiene y por qué:** el shell mide `100dvh` y el tablero y el
  calendario viven de ese alto; una barra persistente resta espacio de trabajo
  en móvil y en pantallas bajas. Un footer dentro del tablero solo aparecería al
  final de la columna más alta, no tendría equivalente en el calendario y
  convive con el drag-and-drop. Ajustes ya es la superficie de la app para lo
  transversal (tema, idioma, copia de seguridad), y la 404 es el único sitio con
  un final de documento. El bloque de Ajustes y el footer de la 404 dan
  presencia sin tocar el espacio de trabajo. Si el dueño prefiere visibilidad
  permanente, se mide una barra de estado y se decide con esa medición.

2026-10-24: queda provisional hasta que el dueño vea el bloque y el footer
funcionando; entonces se confirma o se cambia.
