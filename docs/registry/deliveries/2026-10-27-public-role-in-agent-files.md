---
title: El llms.txt presenta al autor con su puesto público
date: 2026-10-27
phase: none
---
**Objetivo y dueño:** producto; corrección pedida por el dueño el 2026-10-27,
dentro de la revisión de su presencia pública. El dueño fijó ese día que su
puesto público es «Full Stack Developer» en todas partes y que «junior» solo
describe la disponibilidad. No abre fase de producto.

**Qué cambió.**

- `tooling/agent-files/llmsTxt.ts`: la línea del portafolio del autor en la
  sección «Optional» del `llms.txt` decía «Gonzalo Martínez, Junior Full Stack
  Developer.» y pasa a decir «Gonzalo Martínez, Full Stack Developer.». Es la
  única aparición del puesto en lo que el build emite para agentes; la
  interfaz ya decía «Full Stack Developer».
- `tooling/agent-files/generate.test.ts`: un caso nuevo exige esa línea en el
  `llms.txt` construido y que no contenga «junior».
- `index.html`: la etiqueta `author` decía «Gonzalo Martinez Garcia», sin
  tildes. Pasa a «Gonzalo Martínez García», como los créditos de la aplicación
  y sus tests.

**Cómo se verificó.** Antes de editar, `py -3 verify.py` sobre
3198372c80d9680cd3617fa5d14bc0f2cb12d675 salió con código 0: nueve puertas en
verde y 728 comprobaciones del tablero. El caso nuevo se vio fallar contra el
texto anterior: el `llms.txt` construido seguía diciendo «Junior Full Stack
Developer» y el caso quedó en rojo, uno de ocho. Con la corrección pasan los
ocho. La etiqueta `author` no tiene test, porque el build la copia sin tocarla
y ningún contrato del producto la lee.

Después del cambio, `py -3 verify.py` salió con código 0 y nueve puertas en
verde, con 728 comprobaciones del tablero y 24 de documentos; la segunda
corrida no cambió el veredicto. El tablero regeneró sus índices de notas; no
se editaron a mano.
