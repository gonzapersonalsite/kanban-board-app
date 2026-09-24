# Kanban Board App

A Trello-style Kanban board built with React, TypeScript and Feature-Sliced Design. It runs fully in the browser: no backend, no account, data stays in `localStorage`.

**Live demo:** https://kanban-board-app-kappa.vercel.app/

## Features

- **Sample board on first visit**: a fresh browser opens a localized demo board with realistic cards and due dates. Existing saved data is never replaced by it.
- **Multiple boards**: create, rename, switch and delete boards; each board keeps its own columns and cards.
- **Drag and drop**: reorder columns and move cards within or across columns with mouse, touch or keyboard.
- **Cards**: title, description and optional due date, with overdue / due today / upcoming badges.
- **Calendar view**: monthly calendar of the active board's cards by due date.
- **Backup and restore**: export all boards to a versioned JSON file (download, or share where supported) and import it back after reviewing a summary.
- **Languages**: English, Spanish and German, detected from the browser and switchable at any time.
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
pnpm exec husky   # enable the Git hooks (install scripts are skipped above)
pnpm dev
```

## Scripts

```bash
pnpm dev            # Start the dev server
pnpm build          # Type-check + production build
pnpm lint           # ESLint (FSD rules enforced)
pnpm test           # Vitest
pnpm test:coverage  # Vitest with coverage report
pnpm preview        # Preview the production build
```

Git hooks (husky): `pre-commit` lints staged files, `pre-push` runs the production build.

## Architecture

Feature-Sliced Design: see `AGENTS.md` and `.agents/skills/` for the full architectural contract and project conventions.
