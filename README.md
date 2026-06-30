# Kanban Board App

A Trello-style Kanban board built with React, TypeScript, and Feature-Sliced Design. Fully client-side with localStorage persistence.

## Stack

- React 19 + TypeScript (strict)
- Zustand (state + persist)
- @dnd-kit/react (drag & drop)
- CSS Modules (styling)
- lucide-react (icons)
- Vite (build)

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Type-check + production build
pnpm lint       # ESLint (FSD rules enforced)
pnpm test       # Vitest
pnpm preview    # Preview production build
```

## Architecture

Feature-Sliced Design — see `AGENTS.md` and `.agents/skills/` for the full architectural contract.
