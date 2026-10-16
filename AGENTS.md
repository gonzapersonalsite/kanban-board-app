# AGENTS.md — Kanban Board App

## Project Identity
| Property   | Value                                            |
|------------|--------------------------------------------------|
| Stack      | React, TypeScript, Vite, ESLint (flat), pnpm — see package.json for versions |
| Architecture | Feature-Sliced Design, ruled by `docs/ARCHITECTURE.md` |
| Purpose    | Trello-style Kanban board that runs fully in the browser (see README.md). |

---

## Where each rule lives

Each subject has one document that rules it; the others point to it.

| Subject | Document |
|---------|----------|
| The shape of `src`: layers, slices, segments, public APIs, imports, styles, data flow, and what enforces each rule | `docs/ARCHITECTURE.md` |
| The libraries and project conventions: store, drag and drop, styling tokens, icons, dialogs, routing, social preview and agent-readable files, data portability, i18n, theme, test tooling and practices | `.agents/skills/kanban-board-conventions/SKILL.md` |
| How to work on this repository: gates, hooks, recording decisions | this file |
| What the app does and how to set up a clone | `README.md` |

The architecture rules the lint enforces live in `eslint.config.js`, each with
the smallest case that breaks it in `eslint.config.test.ts`.

---

## Skills

Read the matching skill before the work it covers:

| Skill | When to use | Path |
|-------|-------------|------|
| `kanban-board-conventions` | Before changing code, tests, styles or copy in this app (project conventions) | `.agents/skills/kanban-board-conventions/SKILL.md` |
| `react-fsd-maintainer` | Creating a slice, moving code down to another layer, or fixing an architecture finding of the lint | `.agents/skills/react-fsd-maintainer/SKILL.md` |

---

## Code Quality Baseline

- TypeScript `strict: true` — no exceptions.
- `noUnusedLocals: true`, `noUnusedParameters: true` — dead code is deleted, not commented out.
- A lint warning is red and no comment switches a rule off: the rule and what enforces it are in `docs/ARCHITECTURE.md` (introduction); an exception is an owner decision (Recording decisions).
- Prettier formatting rules are switched off in ESLint via `eslint-config-prettier`. No standalone `.prettierrc` unless explicitly added by the user.
- No console.log in production code; use structured logging if needed.
- Errors must be meaningful: no empty catch blocks, no swallowed promises.

---

## Development Workflow

```bash
pnpm dev            # Start dev server with HMR
pnpm build          # TypeScript compilation (tsc -b) + Vite production build
pnpm lint           # ESLint: architecture, TypeScript and React hooks rules; a warning is red
pnpm test           # Vitest: the app tests (jsdom), and the lint cases and the build tooling (node)
pnpm test:coverage  # Vitest with the coverage thresholds of vite.config.ts
pnpm preview        # Preview production build locally
```

Git hooks (husky): `pre-commit` lints the staged files with the same rules and
`--max-warnings=0`; `pre-push` runs `pnpm build`.

A change is done when `pnpm lint`, `pnpm test:coverage` (the tests and the
coverage thresholds) and `pnpm build` are green and the documents it affects
are updated in the same change.

---

## Recording decisions

- **Architecture.** A change to the shape of `src` or an exception to one of
  its rules is an owner decision. It is written in `docs/ARCHITECTURE.md` and,
  when the lint can hold it, in `eslint.config.js` with its case in
  `eslint.config.test.ts`, in the same change.
- **Project conventions.** When an implementation decision is made that the
  whole project must respect (a library, a pattern, an error or testing
  strategy), add it to `.agents/skills/kanban-board-conventions/SKILL.md` in
  the same change. Future agents depend on it.
- A convention that repeats a rule of another document points to it instead
  of copying it.
