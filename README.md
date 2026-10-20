# Kanban Board App

[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](LICENSE)

A Trello-style Kanban board built with React, TypeScript and Feature-Sliced Design. It runs fully in the browser: no backend, no account, data stays in `localStorage`.

**Live demo:** https://kanban-board-app-kappa.vercel.app/

## Features

- **Sample board on first visit**: a fresh browser opens a localized demo board with realistic cards and due dates. It follows the language switcher and is not saved until you change something; existing saved data is never replaced by it.
- **Multiple boards**: create, rename, switch and delete boards; each board keeps its own columns and cards.
- **Drag and drop**: reorder columns and move cards within or across columns with mouse, touch or keyboard.
- **Cards**: title, description and optional due date, with overdue / due today / upcoming badges.
- **Calendar view**: monthly calendar of the active board's cards by due date.
- **Backup and restore**: export all boards to a versioned JSON file (download, or share where supported) and import it back after reviewing a summary.
- **Languages**: Spanish (default at the root route), English (`/en`) and German (`/de`), detected from `?lang=`, URL prefix, saved preference or browser language and switchable at any time.
- **Light and dark themes**, following the system preference by default.

## Stack

- React + TypeScript (strict)
- Zustand (state and `persist` middleware)
- @dnd-kit/react (drag and drop)
- React Router (board and calendar routes)
- CSS Modules (styling) and lucide-react (icons)
- Vite (build), Vitest + Testing Library (tests), ESLint with Feature-Sliced Design rules

Exact versions live in `package.json`.

## Getting started

```bash
pnpm install --frozen-lockfile --ignore-scripts
git config core.hooksPath .githooks
pnpm dev
```

## Scripts and gates

```bash
python verify.py    # Run all repository gates declared in gates.txt
pnpm dev            # Start the dev server
pnpm build          # Type-check + production build
pnpm run typecheck  # TypeScript project build (tsc -b)
pnpm lint           # ESLint: architecture, TypeScript and React hooks rules; a warning is red
pnpm run format:check # Prettier formatting check
pnpm test           # Vitest: the app tests (jsdom), and the lint cases and the build tooling (node)
pnpm test:coverage  # Vitest with the coverage thresholds of vite.config.ts
pnpm preview        # Preview the production build
```

Git hooks (`.githooks/`): `commit-msg` validates the commit message format (`tools/board/commit_message.py`), and `pre-push` refuses to push with uncommitted or untracked files or out-of-date indices and runs `python -I verify.py` (`tools/board/pre_push.py`).

## Architecture

Feature-Sliced Design: `docs/ARCHITECTURE.md` rules the shape of the code and says what enforces each rule; `AGENTS.md` and `.agents/skills/` hold the working rules and the project conventions.

Crawlers do not run the app's JavaScript, so the build writes what they read: the social preview of `index.html` and the files for crawlers and AI agents (llms.txt, robots.txt, sitemap.xml), all from one source, `tooling/agent-files/site.ts`.

## License

**© 2026 Gonzalo Martínez García. All rights reserved.**

This software is **proprietary** and is provided for **evaluation purposes only**.
- **Unauthorized copying**, modification, distribution, or use of this software, via any medium, is strictly prohibited.
- **Personal use for other portfolios is not allowed.**
- See the [LICENSE](LICENSE) file for full terms and conditions.
