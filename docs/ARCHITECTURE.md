# Architecture

Kanban Board is a React application built with Vite and TypeScript and
organised with Feature-Sliced Design. This document rules the shape of the
code in `src`: where each thing goes, what may import what, and where the data
leaves the components. How the repository is worked on is ruled by
`AGENTS.md`; the libraries and the project's own conventions (store, drag and
drop, styling tokens, i18n, test tooling and practices) by the
`kanban-board-conventions` skill; and how to set up a clone by `README.md`.

**Every rule says what enforces it.** The ones the lint enforces have, in
`eslint.config.test.ts`, the smallest case that breaks them, and that test
fails if someone relaxes the rule in `eslint.config.js`. The `fsd-lint/` rules
read static imports only (`import … from`): a dynamic `import()` or a re-export
(`export … from`) that crosses a layer, a slice or a public API is a
convention, because fsd-lint 1.2.1 does not read them. No comment switches a
rule off: the lint reports an `eslint-disable` comment as a warning, and a
warning is red (`--max-warnings=0` in `pnpm lint` and in the pre-commit hook),
so an exception lives in `eslint.config.js`, next to its decision. The rules
marked "convention" are checked by nothing: the review of the diff holds them,
and they become lint rules with their case as soon as someone finds how.

## Layers

`src` holds these six folders, top to bottom, plus the test support
described below:

| Layer | What it holds |
|---|---|
| `app` | The entry point (`src/app/main.tsx`), the providers, the router and the global styles |
| `pages` | A whole screen: it composes what lies below and keeps the code only it uses |
| `widgets` | A large UI block that pages or the app shell use: the board, the calendar, the header |
| `features` | A user action with value of its own: a form, a dialog, drag and drop, a backup |
| `entities` | A business concept: its selectors, its rules and its view |
| `shared` | What knows nothing of a single screen: the domain store (see below), i18n, theme, toasts, utilities and the UI kit |

- **A layer only imports from the layers below it.** Enforced by
  `fsd-lint/forbidden-imports`.
- **Two slices of the same layer do not import each other.** If both need
  something, it moves down a layer. Enforced by
  `fsd-lint/no-cross-slice-dependency`.
- **There are no more layers.** A code file outside those six folders and
  `src/test`, or loose at the root of `src`, is a `no-restricted-syntax`
  error: folders such as `services`, `hooks` or `utils` at the root do not
  exist.
- **The code in `src` is TypeScript in `.ts` and `.tsx` files**, the only
  ones these rules read: a `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` or `.cts`
  file is an error: `no-restricted-syntax`, or a parsing error when it holds
  TypeScript or JSX.
- `app` and `shared` have no slices: their folders are segments
  (`app/router`, `shared/api`, `shared/i18n`, ...). A segment that holds both
  logic and UI splits them into `model`, `lib`, `config` and `ui` folders like
  a slice does (`app/router`), and each UI component of `shared/ui` has a
  folder of its own with its `index.ts`. Convention.

### Decided deviations

Two decisions of this application differ from plain Feature-Sliced Design.
They are narrow, and nothing else follows from them:

- **The domain store lives in `shared/api`.** The Zustand store of the boards,
  columns and tasks, its slices, the domain types, the sample board and the
  restore entry are `src/shared/api`, re-exported by `shared/api/index.ts`;
  entities hold the selectors and routing helpers over it
  (`entities/board/model`) and the views. It is the edge of the application:
  the only code that persists the boards, columns and tasks (to
  `localStorage`, through the `persist` middleware); the i18n and theme stores
  persist only the visitor's preferences. Convention, decided in the
  `kanban-board-conventions` skill (State Management, Store Architecture).
- **The test support lives in `src/test`**: fixtures, helpers and the Vitest
  setup that the tests share, decided in the `kanban-board-conventions` skill
  (Testing). It is the one folder of `src` that is not a layer, and only test
  code imports it: an import of `@/test` from production code is an error,
  `no-restricted-imports` when static and `no-restricted-syntax` when dynamic,
  and a relative path to it leaves its slice, a `fsd-lint/no-relative-imports`
  error. To build a fresh store, the test support may reach inside a `shared`
  segment (`src/test/helpers/storeTestUtils.ts` imports
  `@/shared/api/storeCreator`). Convention.

## Slices and segments

A slice is a folder inside `pages`, `widgets`, `features` or `entities`
(`src/entities/<slice>/`), named in kebab-case. Inside it, only the segments
that hold something:

| Segment | What it holds |
|---|---|
| `ui` | `.tsx` components and their CSS Modules |
| `model` | Types, business rules as pure functions, hooks and state |
| `api` | The calls of the slice to the outside world, if it ever has any |
| `lib` | Internal utilities of the slice |
| `config` | Constants and data files of the slice |

- **From outside, a slice is entered only through its `<slice>/index.ts`**,
  which exports on purpose what is public and nothing else: neither an
  internal file nor a segment (`@/entities/<slice>`, never
  `@/entities/<slice>/model`). Enforced by `fsd-lint/no-public-api-sidestep`
  for pages, widgets, features and entities. `shared` and `app` are entered by
  segment (`@/shared/api`, `@/app/router`), by convention; the one exception,
  in the test support, is under Decided deviations.
- **Between slices, imports use the `@/` alias**, enforced by
  `fsd-lint/no-relative-imports`. **Inside a slice, they use relative paths**,
  by convention: entering the slice itself through the alias, and even more
  through its `<slice>/index.ts`, creates an import cycle the lint does not
  see.
- **There is no UI in `model`, `api` and `lib`**: no `.tsx` files, and no
  import, static or dynamic, of a `ui` segment (the `shared/ui` kit included),
  of styles, of any entry of `react-dom` or of the JSX runtimes, nor
  `createElement`, `cloneElement` or React as a whole (default or namespace
  import): from React, what is logic, such as its hooks, is imported by name.
  Enforced by `no-restricted-imports` and `no-restricted-syntax` on those
  segments. That no component arrives through the public API of another slice
  is convention: the lint sees paths, not what each one exports. Their tests
  may render.
- **Logic reports to the visitor through the infrastructure stores**, never
  through a component: `useToastStore` (`@/shared/toast`) for notifications
  and `useI18nStore` (`@/shared/i18n`) for texts. Convention.
- **Tests live next to what they test**, as `<file>.test.ts` or
  `<file>.test.tsx`, by convention, and the Feature-Sliced Design import rules
  do not apply to them: a test may enter the slice it tests.
- **Every test runs and checks something.** `.skip`, `.todo`, `skipIf` and
  `runIf` are `no-restricted-properties` errors in the tests and in
  `src/test`; Vitest rejects a `.only` (`allowOnly: false`) and fails a test
  that makes no assertion (`expect.requireAssertions`), both in
  `vite.config.ts`.

## Where new code goes

First, in the page that uses it. It moves down when the second consumer
appears, and not before: to `widgets` if it is a UI block, to `features` if it
is a user action, to `entities` if it is a business concept, and to `shared`
if it knows nothing of a single screen. Moving code down is a change with a
diff of its own, which leaves the imports going through the `<slice>/index.ts`
of the new place. Convention; the lint only stops a layer from using what lies
above it.

## Styles

- The styles of a component live next to it, in its `ui` segment, as a CSS
  Module (`<slice>/ui/<Component>.module.css`). That no styles are imported
  from `model`, `api` or `lib` is enforced by the lint; the rest is
  convention.
- The design tokens and the reset of the whole application live in
  `src/app/styles/global.css`, which `src/app/App.tsx` imports and nothing
  else. Convention.

## Data and I/O

- **The flow goes one way:** components read and change the domain state
  through the store of `@/shared/api`, which persists it: directly, with
  `useKanbanStore`, or through a model that adds logic over it, such as the
  hooks of their slice or the selectors and `useBoards` of `entities/board`.
  Components never call `localStorage` or `nanoid` directly and never mutate
  state outside a store action. Convention.
- **The application sends no requests**: its data stays in the browser, and a
  backup is a local file. Outside `src/shared/api`, `fetch`,
  `XMLHttpRequest`, `window.fetch`, `globalThis.fetch` and `self.fetch` are
  `no-restricted-globals` and `no-restricted-properties` errors; tests and the
  test support are left out. A network client, if one is ever decided, lives
  in `src/shared/api` and is an owner decision.
- **The business rules live in `model`**, as pure functions wherever they can
  (the board selectors, the drag-and-drop appliers, the backup snapshot
  checks), **or in the actions of the domain store**, which validate before
  they change anything; each with its test in the same change. Hooks only hold
  state and call them. Convention.

## Names

By convention: components in PascalCase (`<slice>/ui/TaskCard.tsx`), hooks in
camelCase with `use` in front (`<slice>/model/useBoards.ts`), slices in
kebab-case (`<layer>/task-management`) and segments in lowercase.
