---
title: El andamio sale de las estadísticas de lenguaje de GitHub
date: 2026-11-26
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo; el dueño pidió tener GitHub
al día y alineado con su perfil profesional («si es algo a hacer hazlo pues»)
al saber que GitHub presentaba el repositorio como un proyecto Python. No abre
ni cierra ninguna fase ni tramo, y no toca el producto.

**Qué cambió.**

- **`.gitattributes`:** marca `tools/**` y `verify.py` como
  `linguist-vendored`. GitHub deja de contar el andamio al calcular los
  lenguajes del repositorio; nada más cambia: ni los finales de línea, ni los
  diffs, ni lo que git versiona.
- **Por qué hacía falta:** el andamio pesa 832 473 bytes de Python frente a
  448 678 bytes de TypeScript del producto, así que GitHub daba Python como
  lenguaje principal de una aplicación React.

**Cómo se verificó.**

- **El atributo:** `git check-attr linguist-vendored` da `set` para
  `verify.py`, `tools/board/board.py` y `tools/launcher/dev.sh`, y
  `unspecified` para `src/app/main.tsx` y `vite.config.ts`.
- **Las puertas:** `.\dev.cmd verify`, `RESULT: 9 puertas, 0 en rojo`,
  repetida hasta que el veredicto no cambió.

**Pendiente.** La misma línea falta en la plantilla del catálogo de origen:
mientras no entre allí, un repositorio nuevo nace con el mismo defecto.
