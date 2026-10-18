---
title: Adopción de agentic-scaffold, la capa react-vite y el stack react-fsd
date: 2026-10-18
phase: H0
---
**Adopción de agentic-scaffold, la capa react-vite y el stack react-fsd.**
Unifica `kanban-board-app` sobre el motor canónico de `agentic-scaffold`,
`layer:react-vite` y `stack:react-fsd` desde el commit
`39bead6c761666ac5f5648e83bf89a4265d07aaf` de `templates`, siguiendo
`#this-repository-uses-the-agentic-scaffold`.

- **Andamio y hooks:** se instanció `agentic-scaffold` y `layer:react-vite`,
  sustituyendo Husky (`.husky/`, `husky`, `lint-staged`) por
  `.githooks/commit-msg` (`tools/board/commit_message.py`) y
  `.githooks/pre-push` (`tools/board/pre_push.py`). La activación por clon se
  rige por `#hook-activation-is-a-per-clone-step`.
- **Formato y puertas:** se sustituyó `eslint-config-prettier` por `prettier`
  (`3.9.10`), `.prettierrc.json` y `.prettierignore`, y se añadieron los scripts
  `typecheck`, `format` y `format:check` para que las nueve puertas de
  `gates.txt` (`board: tests`, `board: build`, `board: documents`,
  `dependencies`, `format`, `lint`, `typecheck`, `tests`, `build`) corran bajo
  `python verify.py`.
- **Adopción del stack (`stack:react-fsd`):** se sincronizaron `eslint.config.js`
  (soporte de paquetes con scope en `FSD_ALIAS`), `eslint.config.test.ts` y
  `tooling/agent-files/*` (`site.ts`, `llmsTxt.ts`, `sitemap.ts` con escapado XML,
  `vitePlugin.ts` y sus tests), y se registró `stack:react-fsd` en
  `tools/board/components.txt` con las piezas sin uso en este producto marcadas
  como `kept` (`src/shared/api/httpClient.ts`,
  `src/shared/api/httpClient.test.ts`, `vitest.setup.ts`).
- **Verificación:** `python -I verify.py` pasa las 9 puertas (`0 en rojo`), y
  `upgrade.py` informa 0 cambios pendientes frente al commit `39bead6` de
  `templates`.
