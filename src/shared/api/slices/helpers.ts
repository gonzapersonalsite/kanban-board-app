import { nanoid } from 'nanoid'
import type {
  Board,
  BoardId,
  Column,
  ColumnId,
  KanbanState,
  Task,
  TasksByBoard,
  TasksByColumn,
} from './types'
import { useI18nStore } from '@/shared/i18n'

export function getDefaultBoardTitle(): string {
  return useI18nStore.getState().t('board.default_title')
}

export function getSeedColumns(): Column[] {
  const t = useI18nStore.getState().t

  return [
    { id: nanoid(), title: t('seed.column_todo') },
    { id: nanoid(), title: t('seed.column_in_progress') },
    { id: nanoid(), title: t('seed.column_done') },
  ]
}

export function normalizeTasksByColumn(
  columns: Column[],
  tasks: TasksByColumn = {},
): TasksByColumn {
  const normalized: TasksByColumn = {}

  for (const column of columns) {
    normalized[column.id] = [...(tasks[column.id] ?? [])]
  }

  return normalized
}

export function createBoardData(title?: string): {
  board: Board
  columns: Column[]
  tasks: TasksByColumn
} {
  const boardTitle = title?.trim() || getDefaultBoardTitle()
  const columns = getSeedColumns()

  return {
    board: { id: nanoid(), title: boardTitle },
    columns,
    tasks: normalizeTasksByColumn(columns),
  }
}

interface SampleTaskSeed {
  key: string
  dueInDays?: number
}

// One list per seed column, in getSeedColumns() order. Due dates are relative to the
// first visit so the calendar view always shows overdue, today and upcoming cards.
const SAMPLE_TASKS_BY_SEED_COLUMN: SampleTaskSeed[][] = [
  [
    { key: 'plan_sprint', dueInDays: 3 },
    { key: 'onboarding_emails', dueInDays: 8 },
    { key: 'accessibility_audit' },
  ],
  [
    { key: 'landing_redesign', dueInDays: 0 },
    { key: 'safari_login_fix', dueInDays: -1 },
  ],
  [{ key: 'ci_pipeline' }, { key: 'design_tokens' }],
]

function toLocalDateString(base: Date, offsetDays: number): string {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function createSampleTasks(columns: Column[], today: Date): TasksByColumn {
  const t = useI18nStore.getState().t

  return Object.fromEntries(
    columns.map((column, index) => [
      column.id,
      (SAMPLE_TASKS_BY_SEED_COLUMN[index] ?? []).map(({ key, dueInDays }): Task => ({
        id: nanoid(),
        title: t(`seed.tasks.${key}.title`),
        description: t(`seed.tasks.${key}.description`),
        ...(dueInDays === undefined ? {} : { dueDate: toLocalDateString(today, dueInDays) }),
      })),
    ]),
  )
}

// Only visible when nothing is persisted yet (first visit), so the demo never opens empty.
// Persisted data always replaces it on hydration; boards created through addBoard start empty.
export function createInitialKanbanState(today: Date = new Date()): Pick<
  KanbanState,
  'boards' | 'activeBoardId' | 'columnsByBoard' | 'tasksByBoard'
> {
  const { board, columns } = createBoardData()

  return {
    boards: [board],
    activeBoardId: board.id,
    columnsByBoard: {
      [board.id]: columns,
    },
    tasksByBoard: {
      [board.id]: createSampleTasks(columns, today),
    },
  }
}

export function getActiveBoardId(state: Pick<KanbanState, 'activeBoardId'>): BoardId | null {
  return state.activeBoardId
}

export function getActiveBoardColumns(
  state: Pick<KanbanState, 'activeBoardId' | 'columnsByBoard'>,
): Column[] {
  const boardId = getActiveBoardId(state)

  return boardId ? (state.columnsByBoard[boardId] ?? []) : []
}

export function getActiveBoardTasks(
  state: Pick<KanbanState, 'activeBoardId' | 'tasksByBoard'>,
): TasksByColumn {
  const boardId = getActiveBoardId(state)

  return boardId ? (state.tasksByBoard[boardId] ?? {}) : {}
}

export function setActiveBoardColumns(
  columnsByBoard: Record<BoardId, Column[]>,
  boardId: BoardId,
  columns: Column[],
): Record<BoardId, Column[]> {
  return {
    ...columnsByBoard,
    [boardId]: columns,
  }
}

export function setActiveBoardTasks(
  tasksByBoard: TasksByBoard,
  boardId: BoardId,
  tasks: TasksByColumn,
): TasksByBoard {
  return {
    ...tasksByBoard,
    [boardId]: tasks,
  }
}

export function removeBoardTasksByColumns(
  tasks: TasksByColumn,
  columnIds: ColumnId[],
): TasksByColumn {
  const nextTasks = { ...tasks }

  for (const columnId of columnIds) {
    delete nextTasks[columnId]
  }

  return nextTasks
}

export function normalizeTaskMap(
  input: unknown,
): Record<ColumnId, Task[]> {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const entries = Object.entries(input as Record<string, unknown>)

  return Object.fromEntries(
    entries.map(([columnId, tasks]) => [
      columnId,
      Array.isArray(tasks) ? [...(tasks as Task[])] : [],
    ]),
  ) as Record<ColumnId, Task[]>
}
