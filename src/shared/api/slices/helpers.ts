import { nanoid } from 'nanoid'
import type {
  Board,
  BoardId,
  Column,
  ColumnId,
  ColumnsByBoard,
  KanbanState,
  PortableKanbanState,
  Task,
  TasksByBoard,
  TasksByColumn,
} from './types'
import { useI18nStore } from '@/shared/i18n'

const SEED_COLUMN_TITLE_KEYS = [
  'seed.column_todo',
  'seed.column_in_progress',
  'seed.column_done',
] as const

export function getDefaultBoardTitle(): string {
  return useI18nStore.getState().t('board.default_title')
}

export function getSeedColumns(): Column[] {
  const t = useI18nStore.getState().t

  return SEED_COLUMN_TITLE_KEYS.map((key) => ({ id: nanoid(), title: t(key) }))
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
// current visit while nothing is persisted, so the calendar usually shows overdue, today
// and upcoming cards (a card can fall outside the grid near a month boundary).
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

function translateSampleTask(key: string): Pick<Task, 'title' | 'description'> {
  const t = useI18nStore.getState().t

  return {
    title: t(`seed.tasks.${key}.title`),
    description: t(`seed.tasks.${key}.description`),
  }
}

function createSampleTasks(columns: Column[], today: Date): TasksByColumn {
  return Object.fromEntries(
    columns.map((column, index) => [
      column.id,
      (SAMPLE_TASKS_BY_SEED_COLUMN[index] ?? []).map(({ key, dueInDays }): Task => ({
        id: nanoid(),
        ...translateSampleTask(key),
        ...(dueInDays === undefined ? {} : { dueDate: toLocalDateString(today, dueInDays) }),
      })),
    ]),
  )
}

// Only visible while nothing is persisted, so the demo never opens empty.
// Persisted data always replaces it on hydration; boards created through addBoard start empty.
export function createInitialKanbanState(today: Date = new Date()): PortableKanbanState {
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

// Translates an untouched sample board into the current locale. Texts are matched by
// position, which is only valid for a board exactly as createInitialKanbanState built it;
// ids and due dates are kept so routes and React keys stay stable.
export function localizeSampleBoard(sample: PortableKanbanState): PortableKanbanState {
  const t = useI18nStore.getState().t
  const columnsByBoard: ColumnsByBoard = {}
  const tasksByBoard: TasksByBoard = {}

  for (const [boardId, columns] of Object.entries(sample.columnsByBoard)) {
    columnsByBoard[boardId] = columns.map((column, index) => ({
      ...column,
      title: t(SEED_COLUMN_TITLE_KEYS[index]),
    }))
    tasksByBoard[boardId] = Object.fromEntries(
      columns.map((column, index) => [
        column.id,
        (sample.tasksByBoard[boardId]?.[column.id] ?? []).map((task, taskIndex) => ({
          ...task,
          ...translateSampleTask(SAMPLE_TASKS_BY_SEED_COLUMN[index][taskIndex].key),
        })),
      ]),
    )
  }

  return {
    boards: sample.boards.map((board) => ({ ...board, title: getDefaultBoardTitle() })),
    activeBoardId: sample.activeBoardId,
    columnsByBoard,
    tasksByBoard,
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
