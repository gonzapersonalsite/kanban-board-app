---
title: Adopt agentic-scaffold, react-vite layer and react-fsd stack
date: 2026-10-18
phase: H0
---
**Adopt agentic-scaffold, react-vite layer and react-fsd stack.**
Unifies `kanban-board-app` onto the canonical `agentic-scaffold` engine,
`layer:react-vite`, and `stack:react-fsd` from `templates` commit
`39bead6c761666ac5f5648e83bf89a4265d07aaf`, following
`#this-repository-uses-the-agentic-scaffold`.

- **Scaffold and hooks:** instantiated `agentic-scaffold` and `layer:react-vite`,
  replacing Husky (`.husky/`, `husky`, `lint-staged`) with `.githooks/commit-msg`
  (`tools/board/commit_message.py`) and `.githooks/pre-push`
  (`tools/board/pre_push.py`). Per-clone hook activation remains
  `#hook-activation-is-a-per-clone-step`.
- **Formatting and gates:** replaced `eslint-config-prettier` with standalone
  `prettier` (`3.9.10`), `.prettierrc.json`, and `.prettierignore`, and added
  the `typecheck`, `format`, and `format:check` scripts so all nine gates in
  `gates.txt` (`board`, `board-tests`, `guard-tests`, `lockfile`, `format`,
  `lint`, `typecheck`, `tests`, `build`) run under `python verify.py`.
- **Stack adoption (`stack:react-fsd`):** synced `eslint.config.js` (adding
  scoped-package support in `FSD_ALIAS`), `eslint.config.test.ts`, and
  `tooling/agent-files/*` (`site.ts`, `llmsTxt.ts`, `sitemap.ts` with XML
  escaping, `vitePlugin.ts`, and their tests), and recorded `stack:react-fsd` in
  `tools/board/components.txt` with unused network/setup pieces marked `kept`
  (`src/shared/api/httpClient.ts`, `src/shared/api/httpClient.test.ts`,
  `vitest.setup.ts`).
- **Verification:** `python -I verify.py` passes all 9 gates (`0 en rojo`), and
  `upgrade.py` reports 0 pending changes against `templates` `39bead6`.
