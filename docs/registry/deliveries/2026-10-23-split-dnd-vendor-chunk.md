---
title: Separar dnd-kit en su propio chunk de vendor
date: 2026-10-23
phase: none
---
**Objetivo y dueño:** producto; mejora de caché de build encargada por el dueño
a partir de la auditoría del 2026-10-23. Fuera de fase: F0 y F1 están DONE y no
hay fase abierta.

**Qué cambió.**

- `vite.config.ts`: el grupo `dnd-vendor` separa `@dnd-kit` del chunk de la app,
  con prioridad 15, igual que `react-vendor` con prioridad 20.
- `tooling/build/chunking.test.ts`: compila con el `vite.config.ts` real y exige
  que existan `assets/dnd-vendor-*.js` y `assets/react-vendor-*.js`.

**Cifras.** Antes, `index` era 203,7 KB (63,9 KB gzip); ahora `index` es 91,8 KB
(28,6 KB gzip) y `dnd-vendor` 116,7 KB (37,4 KB gzip). La primera carga pesa
prácticamente lo mismo; el beneficio es que un deploy que no cambie dnd-kit
reutiliza su chunk inmutable. `react-vendor` pasó de 304,5 a 311,8 KB por el
reparto de módulos compartidos.

**Cómo se verificó.**

- Al arrancar, `python verify.py`: 9 puertas, 0 en rojo.
- `tooling/build/chunking.test.ts` se vio fallar al retirar el grupo
  `dnd-vendor`: 1 fallo, no existía `assets/dnd-vendor-*.js`. Se deshizo con la
  edición inversa.
- `python verify.py` al terminar: 9 puertas, 0 en rojo.

**Pendiente.** Nada en esta parte.
