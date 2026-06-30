# kanban-board-app — Project Conventions

## State Management

- **Zustand** is the ONLY state library. Do NOT introduce Redux, Jotai, Context API, or any other state tool for cross-component state.
- Store files live at: `shared/api/store.ts` (single store with persist middleware).
- Use the **slices pattern** to organize store logic: create separate slice functions per domain (`createBoardSlice`, `createColumnSlice`, `createTaskSlice`) and compose them into one bound store.
- Apply the `persist` middleware ONLY at the composed store level, never inside individual slices.
- Storage engine: `localStorage` via `createJSONStorage(() => localStorage)` (Zustand built-in). No IndexedDB unless explicitly required.
- Store key name: `kanban-board-storage`.

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
- A thin wrapper component lives in `shared/ui/Dialog.tsx` with imperative open/close via `ref`.
- Use `showModal()` for modal behavior, `close()` for dismissal.

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

- No router for MVP. The app is a single-page Kanban board.
- If multi-board navigation is needed later, use `react-router` with lazy-loaded routes defined in `app/router/index.tsx`.
- Until then, no routing dependency.

## Store Architecture

- Single Zustand store at `shared/api/store.ts` with `persist` middleware.
- Store state shape:
  ```ts
  interface KanbanState {
    columns: Column[]
    tasks: Record<ColumnId, Task[]>
    // actions
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
- Slice functions: `createBoardSlice`, `createColumnSlice`, `createTaskSlice` in separate files under `shared/api/slices/`.

## Domain Types

All domain types live alongside the store in `shared/api/slices/types.ts` and are re-exported via `shared/api/index.ts`. Consumers import from `@/shared/api`:
```ts
type BoardId = string
type ColumnId = string
type TaskId = string

interface Board { id: BoardId; title: string; columnOrder: ColumnId[] }
interface Column { id: ColumnId; title: string }
interface Task { id: TaskId; title: string; description: string }
```

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
- **API**: `useI18nStore` exports `t(key, params?)`, `locale`, `setLocale(locale)`, `availableLocales[]`.
- **Interpolation syntax**: `{{param}}` — e.g., `t('task.edit', { title })`.
- **Type safety**: Keys are strings (dot notation from JSON nesting). No auto-generated type — consumer knows keys from the English JSON.
- **Browser detection**: On first visit (no persisted locale), `navigator.language` is checked and matched against available locales.
- **Seed data**: `columnSlice.ts` calls `useI18nStore.getState().t()` lazily inside the `StateCreator` to resolve seed column titles from the current locale.
- **Dialog close label**: `Dialog` accepts optional `closeLabel` prop (defaults to `'Close dialog'`). Consumers pass `t('dialog.close')`.
- **Import pattern**:
  ```ts
  import { useI18nStore } from '@/shared/i18n'

  function Component() {
    const t = useI18nStore((state) => state.t)
    return <h1>{t('app.title')}</h1>
  }
  ```
- **Adding a locale**: Copy `en.json` → `fr.json`, translate all values. No code changes needed — `import.meta.glob` picks it up automatically.

## Anti-Patterns (Zero Tolerance)

- Never install Tailwind CSS or any CSS-in-JS library.
- Never use `react-beautiful-dnd` or `react-dnd`.
- Never place store logic (Zustand `create`) outside `shared/api/store.ts`.
- Never import from internal files — always use the public API (`index.ts`).
- Never create top-level directories under `src/` outside the 6 FSD layers.
- Never modify `AGENTS.md` or `.agents/skills/react-fsd-maintainer/SKILL.md`.
