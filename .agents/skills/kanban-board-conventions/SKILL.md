# kanban-board-app — Project Conventions

## State Management

- **Zustand** is the ONLY state library. Do NOT introduce Redux, Jotai, Context API, or any other state tool for cross-component state.
- **Domain store** (kanban board data): lives at `shared/api/store.ts`. This is a single store with `persist` middleware.
- **Infrastructure stores** (i18n, theme): live in their own `shared/<slice>/model/store.ts` files. Each is a separate Zustand store with its own `persist` middleware. This pattern is distinct from the domain store — infrastructure stores manage cross-cutting concerns, not business entities.
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

## Styling

- **CSS Modules** is the ONLY styling approach. Do NOT install or use Tailwind CSS, styled-components, Emotion, or any CSS-in-JS library.
- Styles are co-located in `ui/` segment as `<Component>.module.css` next to the `.tsx` file that imports them.
- CSS files MUST NOT be placed in `model/`, `api/`, `lib/`, or `config/` segments.
- Global styles (reset, CSS custom properties) live exclusively in `app/styles/global.css`.
- Shared design tokens (if needed) go in `shared/ui/variables.css`.
- No `styles/` segment in any slice — co-location is the rule.

## Icons

- **lucide-react** is the ONLY icon library. Import individual icons by name (tree-shakable):
  ```ts
  import { Plus, Trash2, Pencil, GripVertical, X } from 'lucide-react'
  ```
- Do NOT import the entire library with `import * as Icons`.

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
- Test files are co-located alongside source files: `<name>.test.tsx` or `<name>.test.ts`.
- Shared test infrastructure lives in `src/test/` (fixtures, helpers, setup). Production code MUST NOT import from `src/test/`.
- Run: `pnpm test` (Vitest), `pnpm test:coverage` (with thresholds).
- Coverage threshold: 70% branches/lines/functions/statements, enforced in `vite.config.ts`.
- AAA pattern mandatory: Arrange → blank line → Act → blank line → Assert.
- Test naming: `does_expected_behavior_when_condition` (snake_case, behaviour-focused).
- Mock only external boundaries (`@dnd-kit/*`, `HTMLDialogElement.showModal`). Never mock domain store slices or owned types.
- Reset Zustand store via `resetPersistedKanbanStore()` from `@/test/helpers/storeTestUtils` before each integration test.
- Deterministic fixtures in `@/test/fixtures/kanbanFixtures`.

## Routing

- **react-router-dom** (v7) is the ONLY routing library. Do NOT install Next.js router, TanStack Router, or any alternative.
- All route definitions live in `app/router/ui/AppRouter.tsx` using `createBrowserRouter` and `RouterProvider`.
- The public API is exported from `app/router/index.tsx` as `AppRouter`.
- Pages MUST be lazy-loaded via `React.lazy()` at the route level for code splitting.
- Route components are wrapped in `<Suspense>` — the fallback is currently `null` (add a shared `<LoadingFallback />` from `shared/ui/` when non-trivial).
- Error boundaries are handled per-route in the future via `errorElement` on route definitions. For now, the app-level `<ErrorBoundary>` in `app/providers/` catches all errors.
- Routing is board-scoped. Final routes are:
  - `/` → redirects to `/board/:activeBoardId`
  - `/board/:boardId` → board view
  - `/calendar` → redirects to `/calendar/:activeBoardId`
  - `/calendar/:boardId` → calendar view
  - `*` → `NotFoundPage`
- URL is the source of truth during navigation. Synchronize route params and store state in `app/router/model/useSyncBoardRoute.ts`, not inside `pages/` or `entities/`.
- Header navigation and board switching MUST preserve the current view while swapping only `:boardId`.

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
- Slice functions: `createBoardSlice`, `createColumnSlice`, `createTaskSlice`, `createDndSlice` in separate files under `shared/api/slices/`.
- Persisted schema migration from the legacy flat state is handled via `version` + `migrate` in `shared/api/store.ts`. Keep the storage key as `kanban-board-storage`.

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

```
Component (ui/) → Store selector (model/) → Store (shared/api/) → localStorage persist
```

- Components NEVER call `fetch()`, `localStorage`, or `nanoid` directly.
- All mutations go through store actions.
- Store selectors are defined in entity `model/` segments for reusability.

## Error Handling

- Zustand actions validate state before mutation (fail-fast).
- No silent catch blocks — every error path must have explicit handling.
- User-facing errors surface via a shared `Toast` or inline validation.
- No `console.log` in production code — use `console.warn` / `console.error` only for development.

## Development Workflow

```bash
pnpm dev        # Vite dev server with HMR
pnpm build      # tsc -b + vite build
pnpm lint       # ESLint with all FSD rules as error
pnpm test       # Vitest
pnpm preview    # Preview production build
```

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
- Seed data: store helpers call `useI18nStore.getState().t()` lazily to resolve localized seed column titles and the default board title from the current locale.
- **Dialog close label**: `Dialog` accepts optional `closeLabel` prop (defaults to `'Close dialog'`). Consumers pass `t('dialog.close')`.
- **Import pattern**:
  ```ts
  import { useTranslation } from '@/shared/i18n'

  function Component() {
    const { t } = useTranslation()
    return <h1>{t('app.title')}</h1>
  }
  ```
- **Adding a locale**: Copy `en.json` → `fr.json`, translate all values. No code changes needed — `import.meta.glob` picks it up automatically.

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
seed/         → seed.column_todo, seed.column_in_progress, seed.column_done
```

Guidelines:
- Namespace per domain (`task`), not per UI location. `cancel` and `save` buttons belong to `task_dialog.*`, not a generic namespace — this prevents collisions when other dialogs are added.
- Reserve `board.*` for board-management UI and `board_view.*` for board-view-only presentation text.
- Placeholders and aria-labels live with their entity (`column.title_placeholder`, `task.title_aria`), not mixed with action keys.
- New features create their own top-level namespace (e.g., `auth.*`, `settings.*`, `confirm_dialog.*`).

### Language switcher

- **Slice**: `features/language-switcher/` — renders a `<select>` with available locales.
- Calls `setLocale` on change; the component subscribes to `state.locale` so the select reflects the current value.
- Display labels are defined in a `LABELS` constant within the component (not translated — locale codes like "EN", "ES" are language-independent abbreviations).
- Embedded in `widgets/header/ui/Header.tsx` inside a `.actions` wrapper div that groups it with `ThemeSwitcher`. The header title has `flex: 1` to push `.actions` to the right.

## Theme System (Dark Mode)

- **Infrastructure slice**: `shared/theme/` — store + types, zero UI. Follows the same pattern as `shared/i18n/`.
- **State**: Zustand store at `shared/theme/model/store.ts` with `persist` middleware (storage key: `theme-preference`). Persists only `theme` value (`'light' | 'dark'`).
- **Initialization**: On rehydration, the store applies `data-theme` attribute on `document.documentElement`. If no persisted value, it falls back to `prefers-color-scheme` media query.
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
- Never place domain store logic (Zustand `create` for kanban entities) outside `shared/api/store.ts`. Infrastructure stores (i18n, theme) are exceptions — see State Management.
- Never import from internal files — always use the public API (`index.ts`).
- Never create top-level directories under `src/` outside the 6 FSD layers.
- Never modify `AGENTS.md` or `.agents/skills/react-fsd-maintainer/SKILL.md`.
- Never use CSS class selectors in `app/styles/global.css` to target dark mode overrides on CSS Module components. Use design tokens (CSS custom properties) instead — see Design Tokens & Dark Mode.
- Never use `transform` inside `@keyframes` animations on components that participate in drag-and-drop. CSS animation declarations override inline styles in the cascade, which breaks `@dnd-kit` positioning. Use only `opacity` in enter animations — see CSS & Animation Constraints.
