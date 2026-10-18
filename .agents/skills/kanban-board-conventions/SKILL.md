---
name: kanban-board-conventions
description: Project conventions of kanban-board-app (state and store architecture, drag and drop, styling and design tokens, icons, IDs, dialogs, tooltips, testing, routing, social preview and agent-readable files, data portability, domain types, error handling, i18n, theme, CSS animation limits and anti-patterns). Use before changing code, tests, styles or copy in this repository, together with react-fsd-maintainer.
---

# kanban-board-app — Project Conventions

## State Management

- **Zustand** is the ONLY state library. Do NOT introduce Redux, Jotai, Context API, or any other state tool for cross-component state.
- **Domain store** (kanban board data): lives at `shared/api/store.ts`. This is a single store with `persist` middleware.
- **Infrastructure stores** (i18n, theme, toast): live in their own `shared/<segment>/model/store.ts` files, each exported by its `shared/<segment>/index.ts`. Each is a separate Zustand store; i18n and theme have their own `persist` middleware, and the toast notifications stay in memory. This pattern is distinct from the domain store — infrastructure stores manage cross-cutting concerns, not business entities.
- Use the **slices pattern** to organize domain store logic: create separate slice functions per domain (`createBoardSlice`, `createColumnSlice`, `createTaskSlice`, `createDndSlice`) and compose them into one bound store.
- Apply the `persist` middleware ONLY at the composed store level for the domain store, never inside individual slices.
- Storage engine: `localStorage` via `createJSONStorage(() => localStorage)` (Zustand built-in). No IndexedDB unless explicitly required.
- Domain store key name: `kanban-board-storage`. Infrastructure stores use their own keys (`i18n-locale`, `theme-preference`).

## Drag & Drop

- `@dnd-kit/react` (latest v0.4+) is the ONLY drag-and-drop library. Do NOT use `react-beautiful-dnd` (deprecated), `react-dnd`, or any alternative.
- Use the new unified API: `DragDropProvider`, `useDraggable`, `useDroppable` from `@dnd-kit/react`. `useSortable` from `@dnd-kit/react/sortable` (subpath export in v0.5+).
- No `SortableContext` — the new API handles this automatically.
- Use `move` helper from `@dnd-kit/helpers` for array mutations.
- Drag feedback is rendered via `<DragOverlay>` from `@dnd-kit/react`.
- Sensors: default pointer sensor (mouse + touch), keyboard sensor for accessibility.
- A drag that moves nothing MUST NOT write to the store. dnd-kit fires a `dragover` with the source over itself as soon as a drag starts, and `move()` then returns the same collection, so `handleDragOver` in `useBoardDndLifecycle` skips `setState` when the applier returns its input. The drag-start snapshot is the store's own references (collections are never mutated in place), so cancelling a drag that moved nothing restores nothing. Otherwise a mere pick-up would persist the untouched sample board (see Store Architecture).
- Screen reader output MUST be localized. Every draggable activator (card wrapper in `DraggableTaskCard`, column content in `ColumnShell` via `SortableColumn`) sets `aria-roledescription={t('dnd.role_description')}` and `aria-describedby={BOARD_DND_INSTRUCTIONS_ID}`, which points to the hidden `dnd.instructions` paragraph rendered by `BoardDndContext`; the dnd-kit Accessibility plugin leaves both attributes alone when they already exist. Live announcements come from `boardDndAnnouncements` (`features/drag-and-drop/model/boardDndAccessibility.ts`), which resolves titles from the store and texts from `dnd.*` when each event fires.
- `@dnd-kit/react` does not export the Accessibility plugin class and `@dnd-kit/dom` is not a direct dependency, so `withBoardDndAnnouncements` passes the announcements to every default plugin (only Accessibility reads them). `BoardDndContext.accessibility.test.tsx` renders the real provider and MUST keep proving that a keyboard pick-up is announced in the current locale; re-check it on every dnd-kit upgrade.

## Styling

- **CSS Modules** is the ONLY styling approach. Do NOT install or use Tailwind CSS, styled-components, Emotion, or any CSS-in-JS library.
- Where styles live (co-located CSS Modules in `ui/`, the global styles and tokens in `app/styles/global.css`) is ruled by `docs/ARCHITECTURE.md`, Styles.
- Typography, iconography, and interactive control sizing MUST be driven by global tokens from `app/styles/global.css`. Do NOT scatter new hard-coded `12px`, `13px`, `14px`, `32px`, or `36px` values across component CSS when an equivalent token already exists.
- Use the typography scale tokens:
  - `--font-size-caption` for metadata, helper text, and compact secondary copy.
  - `--font-size-body-sm` for compact UI text such as nav items, inline buttons, and dense form controls.
  - `--font-size-body` for primary interface text and card titles.
  - `--font-size-body-lg` and heading tokens for prominent labels and page headings.
- Use the control size tokens:
  - `--control-size-sm` for desktop compact controls.
  - `--control-size-md` for primary inputs/selects.
  - `--control-size-lg` for coarse-pointer/touch contexts.
- Use fluid `clamp()`-based tokens for scalable UI. Prefer token reuse over component-specific responsive font rules unless the component has a genuinely unique need.

## Icons

- **lucide-react** is the ONLY icon library. Import individual icons by name (tree-shakable):
  ```ts
  import { Plus, Trash2, Pencil, GripVertical, X } from 'lucide-react'
  ```
- Do NOT import the entire library with `import * as Icons`.
- Icon sizing MUST be consistent with the global icon tokens from `app/styles/global.css`.
- For icons rendered inside shared `Button` or `IconButton`, let the component CSS control the final rendered size. Do NOT micro-tune each icon with ad-hoc per-call sizes unless there is a clear visual exception.
- For standalone icons not wrapped by shared controls, match one of the token tiers conceptually:
  - small affordance/icon hint → `--icon-size-sm`
  - standard action icon → `--icon-size-md`
  - prominent icon → `--icon-size-lg`
- Desktop icon-only controls MUST NOT be visually smaller than `--control-size-sm`. Touch/coarse-pointer contexts MUST use `--control-size-lg`.

## ID Generation

- **nanoid** is the ONLY ID generator. Used for all domain entities (boards, columns, tasks).
- Import: `import { nanoid } from 'nanoid'`
- Call `nanoid()` at creation time for each entity.

## Modals / Dialogs

- Use the native **HTML `<dialog>` element** (Baseline Widely available). Do NOT install a modal library.
- A thin wrapper component lives in `shared/ui/Dialog/Dialog.tsx` with imperative open/close via `ref`.
- Use `showModal()` for modal behavior, `close()` for dismissal.
- The `Dialog` component accepts an optional `closeLabel` prop (defaults to `'Close dialog'`) for the close button's aria-label.

## Tooltips

- Generic tooltip component at `shared/ui/Tooltip/Tooltip.tsx`.
- Accepts `text` (string) and `children` (ReactNode). Wraps any element to show a tooltip on hover/focus.
- Uses `position: fixed` with coordinates calculated via `getBoundingClientRect()` at show time, so it floats above any `overflow: hidden/auto` container (columns, modals).
- Accessibility: connected via `aria-describedby` on the trigger element, `role="tooltip"` on the tooltip.
- Applied to all icon-only buttons in `ColumnHeader` and `TaskCard` (edit, delete, save title, cancel edit).

## Testing

- **Vitest** + **@testing-library/react** + **jsdom** + **@testing-library/jest-dom**.
- Tests live next to what they test (see `docs/ARCHITECTURE.md`, Slices and segments).
- Shared test infrastructure lives in `src/test/` (fixtures, helpers, and the setup `src/test/setup/vitestSetup.ts` with the jsdom stubs and the cleanup after each test). It is the one folder of `src` outside the layers, and production code MUST NOT import from it: the lint rejects it (see `docs/ARCHITECTURE.md`).
- One Vitest configuration, in `vite.config.ts`, with two projects: `app` runs the tests of `src` in jsdom with the setup, and `tooling` runs the tests of the configuration at the root (`eslint.config.test.ts`) and of the build tooling (`tooling/`) in Node.
- Every test runs and asserts: the rule and what enforces it are in `docs/ARCHITECTURE.md` (Slices and segments).
- Run: `pnpm test` (Vitest), `pnpm test:coverage` (with thresholds).
- Coverage: 70% branches/lines/functions/statements; the measured scope and the thresholds live in `vite.config.ts` (`coverage`), checked by `pnpm test:coverage`.
- AAA pattern mandatory: Arrange → blank line → Act → blank line → Assert.
- Test naming: `does_expected_behavior_when_condition` (snake_case, behaviour-focused).
- Mock only external boundaries (`@dnd-kit/*`, `HTMLDialogElement.showModal`). Never mock domain store slices or owned types.
- Reset Zustand store via `resetPersistedKanbanStore()` from `@/test/helpers/storeTestUtils` before each integration test.
- Deterministic fixtures in `@/test/fixtures/kanbanFixtures`.

## Routing

- **react-router-dom** (v7) is the ONLY routing library. Do NOT install Next.js router, TanStack Router, or any alternative.
- All route definitions live in `app/router/ui/AppRouter.tsx` using `createBrowserRouter` and `RouterProvider`.
- The public API is exported from `app/router/index.ts` as `AppRouter`.
- Pages MUST be lazy-loaded via `React.lazy()` at the route level for code splitting.
- Route components are wrapped in `<Suspense>` — the fallback is currently `null` (add a shared `<LoadingFallback />` from `shared/ui/` when non-trivial).
- Shared route chrome (`Header`, future persistent navigation, and other app-shell UI) MUST live in an `app/router` layout route with `<Outlet />`, never inside individual page components. Pages render only route-specific content.
- Error boundaries are handled per-route in the future via `errorElement` on route definitions. For now, the app-level `<ErrorBoundary>` in `app/providers/` catches all errors.
- Routing is board-scoped. Final routes are:
  - root path → redirects to `/board/:activeBoardId`
  - `/board/:boardId` → board view
  - `/calendar` → redirects to `/calendar/:activeBoardId`
  - `/calendar/:boardId` → calendar view
  - `*` → `NotFoundPage`
- URL is the source of truth during navigation. Synchronize route params and store state in `app/router/model/useSyncBoardRoute.ts`, not inside `pages/` or `entities/`.
- Header navigation and board switching MUST preserve the current view while swapping only `:boardId`.

## Social Preview & Agent-Readable Files

- Social crawlers, search engines and AI agents read `index.html` without running JavaScript, so what they must see is written by the build: `tooling/agent-files/vitePlugin.ts`, registered in `vite.config.ts`. `usePageMeta` only updates the title and description for people browsing the app.
- **One source:** `tooling/agent-files/site.ts` holds the site address (`SITE_URL`, `absoluteUrl`) and the name and description of the whole site. The app never needs its own address, so it lives with its only consumer, the build tooling, not in `src`; a change of domain changes `SITE_URL` and nothing else.
- **Social preview:** `index.html` declares the Open Graph and Twitter tags with `og:url` pointing to the site root and root-relative image paths. The build writes the title, the description and the absolute addresses from `site.ts`, and refuses an image path that is not root-relative or a tag it writes that is missing or repeated; the values in `index.html` only serve the dev server. Twitter/X falls back to `og:title` and `og:description`, so `index.html` does not repeat them.
- **Cover:** `public/og-cover.png`, a 1200×630 PNG whose type, size and alt text `index.html` declares. It shows the app name, tagline and stack over a board drawn with the dark theme tokens, rendered from an HTML page in headless Edge; name and tagline sit inside the central 630×630 square for previews that crop it square. Platforms cache previews by URL, so a changed image gets a new file name; after the deploy, refresh the preview with LinkedIn Post Inspector.
- **Agent files:** the build emits llms.txt (a summary and links, in the llmstxt.org format), robots.txt (allows everything and names the sitemap) and sitemap.xml (only the root: the board and calendar addresses name the boards each visitor keeps in their own browser), and the dev server serves the same files. Vercel serves the built files before the SPA rewrite of `vercel.json`. None of them is written by hand in `public/`.
- The tests next to each module of `tooling/agent-files/` check the generators, the shell against the real `index.html` and the cover's real type and size, and build and serve the app with the real `vite.config.ts`.

## Store Architecture

- Single Zustand store at `shared/api/store.ts` with `persist` middleware.
- Store state shape:
  ```ts
  interface KanbanState {
    boards: Board[]
    activeBoardId: BoardId | null
    columnsByBoard: Record<BoardId, Column[]>
    tasksByBoard: Record<BoardId, Record<ColumnId, Task[]>>

    // board actions
    addBoard(title?: string): void
    updateBoard(id: BoardId, title: string): void
    deleteBoard(id: BoardId): void
    setActiveBoard(id: BoardId): void

    // active-board-scoped actions
    addColumn(title: string): void
    updateColumn(id: ColumnId, title: string): void
    deleteColumn(id: ColumnId): void
    reorderColumns(fromIndex: number, toIndex: number): void
    addTask(columnId: ColumnId, title: string): void
    updateTask(columnId: ColumnId, taskId: TaskId, data: Partial<Task>): void
    deleteTask(columnId: ColumnId, taskId: TaskId): void
    moveTask(sourceColId: ColumnId, destColId: ColumnId, taskId: TaskId, newIndex: number): void
    reorderTask(columnId: ColumnId, fromIndex: number, toIndex: number): void
  }
  ```
- The persisted domain state MUST always contain at least one board.
- First-visit sample board: `createInitialKanbanState()` in `shared/api/slices/helpers.ts` is the pre-hydration state, so it is only visible when nothing is persisted under `kanban-board-storage`. It seeds the localized default board with sample tasks (`seed.tasks.*`) whose due dates are relative to the current visit. Persisted data MUST always replace it on hydration — never merge sample tasks into stored data and never re-add them. Boards created through `addBoard` start empty (`createBoardData`).
- Sample board lifecycle (`createSampleBoardLifecycle()` in `shared/api/sampleBoard.ts`, wired once in `shared/api/store.ts`): while the sample is untouched it is never written to storage, and a locale change re-localizes it in place with `localizeSampleBoard()` (same ids and due dates, so routes and React keys stay valid). "Untouched" is decided by reference identity of `boards`, `activeBoardId`, `columnsByBoard` and `tasksByBoard`, so every store action MUST keep replacing the collections it changes instead of mutating them. The first change is persisted as usual and, from then on, locale changes never touch the board. Never relocalize or rewrite persisted data.
- Slice functions: `createBoardSlice`, `createColumnSlice`, `createTaskSlice`, `createDndSlice` in separate files under `shared/api/slices/`.
- Persisted schema migration from the legacy flat state is handled via `version` + `migrate` in `shared/api/store.ts`. Keep the storage key as `kanban-board-storage`.

## Data Portability

- Public backup/import contracts live in `features/data-portability/`. Do NOT couple them to Zustand `persist` internals.
- The portable format is a versioned snapshot contract (`schemaVersion`, `exportedAt`, `boards`, `activeBoardId`, `columnsByBoard`, `tasksByBoard`).
- Never export or import the raw `localStorage` blob from `kanban-board-storage` as the public backup format.
- Snapshot validation and normalization must happen inside `features/data-portability/model/` before any restore flow touches the domain store.
- Domain restore enters ONLY through `shared/api/restore.ts`. Do NOT restore data by mutating `localStorage` directly or by patching state from UI components.
- Restore must be atomic: validate and normalize first, write to the store once, and leave the current state untouched on failure.
- Export UI lives in the Header settings dialog, never inside `board-management`.
- Export always offers file download first. `navigator.share` is progressive enhancement only and must never replace the download path.
- Import UI also lives in the Header settings dialog and follows a two-step flow: select file → review summary → confirm destructive replace.
- After a successful import, navigate to the restored `activeBoardId` while preserving the current view (`board` or `calendar`).
- Data portability is strictly local-file based. Do NOT introduce URL payload sharing, remote sync, or backend-backed transfer flows unless the user explicitly changes this project decision in a later session.

## Domain Types

All domain types live alongside the store in `shared/api/slices/types.ts` and are re-exported via `shared/api/index.ts`. Consumers import from `@/shared/api`:
```ts
type BoardId = string
type ColumnId = string
type TaskId = string

interface Board { id: BoardId; title: string }
interface Column { id: ColumnId; title: string }
interface Task { id: TaskId; title: string; description: string }
```

- Board-scoped selector helpers and routing helpers live in `entities/board/model/` and are re-exported via `entities/board/index.ts`.

## Data Flow

The data flow (how components reach the domain store, its persistence in `localStorage`, no requests) is ruled by `docs/ARCHITECTURE.md`, Data and I/O.

## Error Handling

- Zustand actions validate state before mutation (fail-fast).
- No silent catch blocks — every error path must have explicit handling.
- User-facing errors surface via a shared `Toast` (`useToastStore` from `@/shared/toast`, rendered by `Toast` from `@/shared/ui` in `app/App.tsx`) or inline validation.
- No `console.log` in production code — use `console.warn` / `console.error` only for development.

## Development Workflow

The commands, gates (`gates.txt`, `python verify.py`) and hooks (`.githooks/`) are in `AGENTS.md` and `README.md`.

## Internationalization (i18n)

- **i18n slice**: `shared/i18n/` — cross-cutting infrastructure, zero business logic.
- **Translation files**: JSON per locale in `shared/i18n/config/`. Flat keys are generated by a `flattenTranslations` utility at load time.
- **Locale discovery**: `import.meta.glob` auto-discovers all `*.json` files in the config directory. Adding a new locale = adding a new JSON file.
- **State**: Zustand store at `shared/i18n/model/store.ts` with `persist` middleware (storage key: `i18n-locale`). Only `locale` is persisted; translations are re-derived on rehydration.
- **Reactivity**: Components use `useTranslation()` hook (not direct store selector) to ensure reactive re-renders when locale changes. `useTranslation()` subscribes to `state.locale` (a string that changes) and returns a fresh `t` closure each render.
- **API**: `useTranslation()` returns `{ t, locale, setLocale, availableLocales }`.
  - `t(key, params?)` — resolves and interpolates a translation key.
  - `locale` — current locale string.
  - `setLocale(locale)` — switches locale, persists to localStorage.
  - `availableLocales` — list of available locale codes derived from JSON files.
- **Interpolation syntax**: `{{param}}` — e.g., `t('task.edit', { title })`.
- **Type safety**: Keys are strings (dot notation from JSON nesting). No auto-generated type — consumer knows keys from the English JSON.
- **Browser detection**: On first visit (no persisted locale), `navigator.language` is checked and matched against available locales.
- **Document language**: `shared/i18n/model/store.ts` keeps `document.documentElement.lang` equal to the active locale at startup and on every locale change (English for a locale without messages), so screen readers read the UI and the drag-and-drop announcements with the right pronunciation rules. `lang="en"` in `index.html` is only the default before the app starts; never set `lang` anywhere else.
- Seed data: store helpers call `useI18nStore.getState().t()` lazily to resolve localized seed column titles, the default board title and the first-visit sample tasks from the current locale. The untouched sample board also follows later locale changes (see Store Architecture); columns and boards the visitor already changed or created keep the language they were created in.
- **Dialog close label**: `Dialog` accepts optional `closeLabel` prop (defaults to `'Close dialog'`). Consumers pass `t('dialog.close')`.
- **Import pattern**:
  ```ts
  import { useTranslation } from '@/shared/i18n'

  function Component() {
    const { t } = useTranslation()
    return <h1>{t('app.title')}</h1>
  }
  ```
- **Adding a locale**: Copy `src/shared/i18n/config/en.json` to a new locale file in `src/shared/i18n/config/` (like `src/shared/i18n/config/es.json` or `src/shared/i18n/config/de.json`) and translate all values. No code changes needed — `import.meta.glob` picks it up automatically.
- **Locale parity**: `shared/i18n/config/locales.test.ts` enforces that every locale has exactly the English flattened keys, the same `{{placeholders}}` in each message and no empty messages. Never add a key to one locale only.
- **Copy style**: Spanish copy is Spain Spanish in sentence case (only the first word and proper nouns capitalised): `Añadir`, `Ajustes`, `copia de seguridad`; never Latin American variants such as `Agregar`. English copy is also sentence case (`New board`, `Add card`, `To do`) with US spelling (`canceled`, `color`, `prioritize`); only the product name `Kanban Board` keeps its capitals. `Kanban` is always capitalised as the name of the method (`Kanban board`, `tablero Kanban`, `Kanban-Board`). German copy uses the informal `du`. Keep the meaning of EN, ES and DE aligned.
- **Sample task descriptions** (`seed.tasks.*.description`) MUST fit the card's two-line clamp in the narrowest desktop column (about 230px wide at a ~1250px viewport, roughly 55 characters in Inter) in every locale. Measure them in the browser after any change.

### Translation key structure

Keys are organised in namespaces that mirror feature/entity boundaries:

```
app/          → app.title
 board/        → board.add, board.rename, board.delete, board.default_title
 board_view/   → board_view.empty_column
column/       → column.add, column.rename, column.title_placeholder, column.title_aria, ...
task/         → task.add, task.edit, task.delete, task.title_placeholder, task.title_aria
task_dialog/  → task_dialog.title, task_dialog.title_label, task_dialog.cancel, task_dialog.save, ...
dialog/       → dialog.close
seed/         → seed.column_todo, seed.column_in_progress, seed.column_done, seed.tasks.<id>.title|description
dnd/          → dnd.role_description, dnd.instructions, dnd.cancelled, dnd.task|column.picked_up|over_column|dropped
```

Guidelines:
- Namespace per domain (`task`), not per UI location. `cancel` and `save` buttons belong to `task_dialog.*`, not a generic namespace — this prevents collisions when other dialogs are added.
- Reserve `board.*` for board-management UI and `board_view.*` for board-view-only presentation text.
- Placeholders and aria-labels live with their entity (`column.title_placeholder`, `task.title_aria`), not mixed with action keys.
- New features create their own top-level namespace (e.g., `auth.*`, `settings.*`, `confirm_dialog.*`).

### Language switcher

- **Slice**: `features/language-switcher/` — renders a `<select>` with available locales.
- Reads `t`, `locale`, `setLocale` and `availableLocales` from `useTranslation()`; calls `setLocale` on change and reflects the current `locale`.
- The select MUST carry `aria-label={t('header.language')}`: the visible "Language" text next to it is a plain `<span>`, so without it screen readers announce only "EN, combo box".
- Display labels are defined in a `LABELS` constant within the component (not translated — locale codes like "EN", "ES" are language-independent abbreviations).
- Rendered in the Header settings dialog (`widgets/header/ui/Header.tsx`), next to `ThemeSwitcher` and the data portability sections.

## Theme System (Dark Mode)

- **Infrastructure slice**: `shared/theme/` — store + types, zero UI. Follows the same pattern as `shared/i18n/`.
- **State**: Zustand store at `shared/theme/model/store.ts` with `persist` middleware (storage key: `theme-preference`). Persists only `theme` value (`'light' | 'dark'`).
- **Initialization**: On rehydration, the store applies `data-theme` attribute on `document.documentElement`. If no persisted value, it falls back to `prefers-color-scheme` media query without storing it, so the theme keeps following the system until the visitor toggles it.
- zustand calls `merge` with `undefined` when nothing is stored (a first visit), and `persist` silently swallows anything `merge` throws. The `merge` of both infrastructure stores (theme and i18n) MUST handle a missing persisted state; `shared/theme/model/store.test.ts` proves a first visit follows a dark and a light system preference.
- **UI feature**: `features/theme-switcher/` — renders a sun/moon toggle button (lucide-react `Sun`/`Moon` icons). Imports `useThemeStore` from `@/shared/theme`.
- **Import pattern**:
  ```ts
  import { useThemeStore } from '@/shared/theme'
  import { ThemeSwitcher } from '@/features/theme-switcher'
  ```
- **Public API** (`shared/theme/index.ts`): exports `useThemeStore`, `Theme` type, `ThemeStore` type.
- **Public API** (`features/theme-switcher/index.ts`): exports `ThemeSwitcher` only. The store is NOT re-exported from features — consumers import it directly from `@/shared/theme`.

## Design Tokens & Dark Mode

- **Token location**: All design tokens live in `app/styles/global.css` inside `:root` for light mode and `[data-theme='dark']` for dark mode.
- **Dark mode approach**: Rely EXCLUSIVELY on CSS custom properties. NEVER use class selectors in global.css to target dark-mode overrides on CSS Module components — CSS Modules hash class names, so `[data-theme='dark'] .card` would NOT match `TaskCard_card__abc123`.
- **Element selectors are safe**: `[data-theme='dark'] header`, `[data-theme='dark'] dialog::backdrop`, etc. target HTML elements (not classes), so they work across CSS Modules.
- **Card-specific tokens**: Since card backgrounds are translucent glass effects, they need their own tokens:
  - `--color-card-bg`: semi-transparent background (light: `rgba(255,255,255,0.7)`, dark: `rgba(39,39,42,0.6)`)
  - `--color-card-border`: semi-transparent border (light: `rgba(255,255,255,0.5)`, dark: `rgba(255,255,255,0.06)`)
  - `--color-card-shadow`: card shadow color (light: indigo tint, dark: black tint)
  - `--color-card-shadow-hover`: card hover shadow color
- **Column accent colors**: Defined as a constant array `COLUMN_ACCENT_COLORS` in `widgets/board/ui/Board.tsx`. Passed to `SortableColumn` → `ColumnShell` as `accentColor` prop, applied via inline `style` as `--column-accent` CSS custom property. Same color is passed to `DraggableTaskCard` → `TaskCard` as `--card-accent` for the left border stripe. Colors cycle via `index % COLUMN_ACCENT_COLORS.length`.
- **Header glassmorphism**: `widgets/header/ui/Header.module.css` uses `background: rgba(255,255,255,0.75)` + `backdrop-filter: blur(16px)`. Dark mode override via element selector `[data-theme='dark'] header { background: rgba(39,39,42,0.75) }` in global.css.
- **Button primary gradient**: `shared/ui/Button/Button.module.css` uses `background: linear-gradient(135deg, #6366f1, #8b5cf6)` with colored `box-shadow`. Hover darkens the gradient + `translateY(-1px)`.

## CSS & Animation Constraints

- **No `transform` in `@keyframes` on sortable elements**: CSS animation declarations (`@keyframes`) sit above normal author declarations (including inline `style`) in the CSS cascade. If a `@keyframes` declares `transform`, it overrides any inline `transform` set by `@dnd-kit` during drag operations, breaking drag-and-drop entirely.
  - ✅ `@keyframes` with `opacity` only → safe for enter animations on cards and columns.
  - ✅ `transform` in `.hover` or `.overlayCard` selectors → safe (not inside `@keyframes`, and overlays are separate elements).
  - ❌ `@keyframes` with `transform: scale(...)` or `transform: translateY(...)` → BREAKS dnd-kit positioning.
- **Enter animations**: `cardEnter` (TaskCard) and `columnEnter` (ColumnShell) are simple `opacity` fades with `animation-fill-mode: both`. No scale/slide.
- **Drag overlay rotation**: `BoardDndContext.module.css` adds `rotate(2deg)` to `.overlayCard` via a static `transform` rule (not a keyframe). This is safe because the DragOverlay is a separate element rendered by dnd-kit, not a sortable item.

## Anti-Patterns (Zero Tolerance)

- Never install Tailwind CSS or any CSS-in-JS library.
- Never use `react-beautiful-dnd` or `react-dnd`.
- Never place domain store logic (Zustand `create` for kanban entities) outside `shared/api/store.ts`. Infrastructure stores (i18n, theme, toast) are exceptions — see State Management.
- Never use CSS class selectors in `app/styles/global.css` to target dark mode overrides on CSS Module components. Use design tokens (CSS custom properties) instead — see Design Tokens & Dark Mode.
- Never use `transform` inside `@keyframes` animations on components that participate in drag-and-drop. CSS animation declarations override inline styles in the cascade, which breaks `@dnd-kit` positioning. Use only `opacity` in enter animations — see CSS & Animation Constraints.
