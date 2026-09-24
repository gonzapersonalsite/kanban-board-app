import type { ComponentProps } from 'react'
import type {
  DragDropProvider,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/react'
import { selectActiveBoardColumns, selectActiveBoardTasks } from '@/entities/board'
import { useKanbanStore, type KanbanState } from '@/shared/api'
import { useI18nStore } from '@/shared/i18n'

// Referenced through aria-describedby by every draggable card and column on the board.
export const BOARD_DND_INSTRUCTIONS_ID = 'board-dnd-instructions'

type DragSource = DragStartEvent['operation']['source']
type DropTarget = DragOverEvent['operation']['target']
type DraggableType = 'task' | 'column'
type MessageParams = Record<string, string | number>

interface DraggableKind {
  findTitle(state: KanbanState, id: string): string | undefined
  describeDrop(state: KanbanState, id: string): MessageParams | undefined
}

function findTaskColumnId(state: KanbanState, taskId: string): string | undefined {
  const tasks = selectActiveBoardTasks(state)

  return Object.keys(tasks).find((columnId) => tasks[columnId].some((task) => task.id === taskId))
}

function findColumnTitle(state: KanbanState, columnId: string | undefined): string | undefined {
  return selectActiveBoardColumns(state).find((column) => column.id === columnId)?.title
}

const DRAGGABLE_KINDS: Record<DraggableType, DraggableKind> = {
  task: {
    findTitle: (state, id) => {
      const columnId = findTaskColumnId(state, id)

      return columnId
        ? selectActiveBoardTasks(state)[columnId].find((task) => task.id === id)?.title
        : undefined
    },
    describeDrop: (state, id) => {
      const column = findColumnTitle(state, findTaskColumnId(state, id))

      return column === undefined ? undefined : { column }
    },
  },
  column: {
    findTitle: (state, id) => findColumnTitle(state, id),
    describeDrop: (state, id) => {
      const columns = selectActiveBoardColumns(state)
      const index = columns.findIndex((column) => column.id === id)

      return index === -1 ? undefined : { position: index + 1, total: columns.length }
    },
  },
}

interface DraggedItem {
  type: DraggableType
  id: string
  title: string
  state: KanbanState
}

function describeSource(source: DragSource): DraggedItem | undefined {
  if (!source || (source.type !== 'task' && source.type !== 'column')) {
    return undefined
  }

  const state = useKanbanStore.getState()
  const id = String(source.id)
  const title = DRAGGABLE_KINDS[source.type].findTitle(state, id)

  return title === undefined ? undefined : { type: source.type, id, title, state }
}

// Both sortable cards and sortable columns carry the id of their column in `data`.
function findTargetColumnTitle(target: DropTarget): string | undefined {
  const columnId = target?.data?.columnId ?? target?.id

  return columnId === undefined
    ? undefined
    : findColumnTitle(useKanbanStore.getState(), String(columnId))
}

function translate(key: string, params: MessageParams): string {
  return useI18nStore.getState().t(key, params)
}

// Texts are resolved when each event fires, so they always use the current locale and the
// current titles. At dragend the board already shows the final position, because
// drag-over updates are applied to the store while dragging.
export const boardDndAnnouncements = {
  dragstart({ operation: { source } }: DragStartEvent): string | undefined {
    const dragged = describeSource(source)

    return dragged && translate(`dnd.${dragged.type}.picked_up`, { title: dragged.title })
  },

  dragover({ operation: { source, target } }: DragOverEvent): string | undefined {
    const dragged = describeSource(source)
    const column = target && target.id !== source?.id ? findTargetColumnTitle(target) : undefined

    return dragged && column !== undefined
      ? translate(`dnd.${dragged.type}.over_column`, { title: dragged.title, column })
      : undefined
  },

  dragend({ operation: { source }, canceled }: DragEndEvent): string | undefined {
    const dragged = describeSource(source)
    if (!dragged) {
      return undefined
    }

    if (canceled) {
      return translate('dnd.cancelled', { title: dragged.title })
    }

    const drop = DRAGGABLE_KINDS[dragged.type].describeDrop(dragged.state, dragged.id)

    return drop && translate(`dnd.${dragged.type}.dropped`, { title: dragged.title, ...drop })
  },
}

type PluginsOption = NonNullable<ComponentProps<typeof DragDropProvider>['plugins']>
type PluginList = Exclude<PluginsOption, (...args: never[]) => unknown>

const ANNOUNCEMENT_OPTIONS = { announcements: boardDndAnnouncements }

// @dnd-kit/react does not export its Accessibility plugin class, so the announcements are
// handed to every default plugin: Accessibility reads `announcements`, while the other
// defaults (AutoScroller, Cursor, Feedback, PreventSelection) only read their own option
// keys. Instructions and role description are set on the draggables themselves, which
// the plugin leaves untouched when they are already present.
export function withBoardDndAnnouncements(defaults: PluginList): PluginList {
  return defaults.map((plugin) =>
    typeof plugin === 'function' ? { plugin, options: ANNOUNCEMENT_OPTIONS } : plugin,
  )
}
