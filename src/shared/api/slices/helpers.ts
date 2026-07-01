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

export function createInitialKanbanState(): Pick<
  KanbanState,
  'boards' | 'activeBoardId' | 'columnsByBoard' | 'tasksByBoard'
> {
  const { board, columns, tasks } = createBoardData()

  return {
    boards: [board],
    activeBoardId: board.id,
    columnsByBoard: {
      [board.id]: columns,
    },
    tasksByBoard: {
      [board.id]: tasks,
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
