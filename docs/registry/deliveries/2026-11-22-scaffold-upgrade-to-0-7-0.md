---
title: Actualización a agentic-scaffold 0.7.0 y lanzador containerizado
date: 2026-11-22
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño, para
subir todas las instancias del catálogo a `agentic-scaffold` 0.7.0 sin deuda
pendiente. `templates` publicó 0.7.0 en el commit `2e152c6`: el andamio y las
puertas React corren en contenedores Docker Linux coordinados desde el host con
`dev` / `dev.cmd`. Este repositorio lo toma con `templates upgrade` desde
`4948119`.

**Qué cambió.**

- **Reconciliación previa:** `docs/ARCHITECTURE.md` incorporó los dos ajustes
  de redacción de `react-fsd` 0.7.0 (`./dev lint` y punteros a `README.md` y
  `AGENTS.md`) conservando la arquitectura propia de Kanban Board y la skill
  `kanban-board-conventions`, y cerró su traspaso de dueño
  (`layer:react-vite` → `stack:react-fsd`) con `--done`.
- **Motor**, de 0.6.0 a 0.7.0 (`4948119` → `2e152c6`): se actualizan
  `verify.py`, `tools/board/`, `tools/guards/`, `.githooks/commit-msg` y
  `.githooks/pre-push`, se borra `.githooks/python.sh`, y entran `dev`,
  `dev.cmd`, `tools/launcher/`, `docs/ACTUALIZAR.md` y el runtime del andamio
  (`Dockerfile.scaffold`, `compose.scaffold.yaml`, `scaffold.json`).
- **Stack `react-fsd` y capa `react-vite`:** entran `Dockerfile`,
  `.dockerignore`, `compose.yaml`, `tools/stack.txt`, `tools/react.sh` y
  `tools/install-pnpm.py`; las 6 puertas del producto en `gates.txt` pasan a
  `@stack:*` conservando los segundos de referencia, los parches locales de
  `eslint.config.js`, `eslint.config.test.ts` y `tooling/agent-files/`, y los
  ficheros `kept`.
- **A mano (13 pendientes cerrados con `--done`):** `AGENTS.md` (§1, §3 con
  las dos viñetas nuevas de `react-vite`, §4 con `docs/ACTUALIZAR.md` y §8),
  `.agents/skills/audit-before-commit/SKILL.md`, `.gitattributes` (`*.cmd` en
  CRLF), `.gitignore` (`.dev-runtime/`), `tools/board/documents.txt`
  (`docs/ACTUALIZAR.md`, `generated .dev-runtime` y extensiones `.cmd`, `.ps1`,
  `.sh`), `README.md` con las entradas `dev` / `dev.cmd`, `docs/TOOLING.md`
  (sin tramos abiertos) y bits ejecutables de `dev` y `tools/launcher/dev.sh`.
- **Lockfile de herramienta:** el documento inicial `packageManagerDependencies`
  de `pnpm-lock.yaml` se alineó de pnpm 12.14.0 a 12.21.0 (la versión ya fijada
  en `package.json`, con los hashes SHA-512 verificados) sin alterar el grafo
  de dependencias del producto.

**Cómo se verificó.** El árbol de partida estaba limpio. `templates upgrade`
planificó `ea9712794ef7` sin conflictos y `--apply` lo escribió; todos los
pendientes quedaron cerrados con `--done` (`0` pendientes). Posteriormente se
aplicó el parche `2e152c6` → `d086d1e` de `tools/launcher/dev.ps1` (plan
`c4fd49e022b7`, reintento ante bloqueos breves de archivo en Windows).
`.\dev.cmd prepare` construyó las imágenes y restauró las dependencias con
`--ignore-scripts`; `.\dev.cmd verify` salió en verde con las 9 puertas (811
checks del tablero, 28 comprobaciones de documentos y 511 tests de Vitest, 0
fallos).

**Pendiente.** Nada de esta parte.
