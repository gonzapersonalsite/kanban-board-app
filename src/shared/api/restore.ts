import type {
  Board,
  BoardId,
  Column,
  ColumnId,
  PortableKanbanState,
  Task,
  TasksByBoard,
  TasksByColumn,
} from './slices/types'
import { useKanbanStore } from './store'

export class KanbanRestoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KanbanRestoreError'
  }
}

export function restoreKanbanState(snapshot: unknown): PortableKanbanState {
  return restoreKanbanStateInStore(
    (nextState) => useKanbanStore.setState(nextState),
    snapshot,
  )
}

export function restoreKanbanStateInStore(
  setState: (nextState: PortableKanbanState) => void,
  snapshot: unknown,
): PortableKanbanState {
  const restoredState = normalizePortableKanbanState(snapshot)

  setState(restoredState)

  return restoredState
}

export function normalizePortableKanbanState(
  input: unknown,
): PortableKanbanState {
  const candidate = toRecord(input, 'Restore state must be an object.')
  const boards = normalizeBoards(candidate.boards)
  const activeBoardId = normalizeActiveBoardId(candidate.activeBoardId, boards)
  const columnsByBoard = normalizeColumnsByBoard(candidate.columnsByBoard, boards)
  const tasksByBoard = normalizeTasksByBoard(candidate.tasksByBoard, boards, columnsByBoard)

  return {
    boards,
    activeBoardId,
    columnsByBoard,
    tasksByBoard,
  }
}

function normalizeBoards(value: unknown): Board[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new KanbanRestoreError('Restore state must contain at least one board.')
  }

  const seenBoardIds = new Set<string>()

  return value.map((board, index) => {
    const candidate = toRecord(board, `Board at index ${index} must be an object.`)
    const id = normalizeNonEmptyString(candidate.id, `Board at index ${index} is missing an id.`)
    const title = normalizeNonEmptyString(candidate.title, `Board "${id}" must have a title.`)

    if (seenBoardIds.has(id)) {
      throw new KanbanRestoreError(`Board id "${id}" is duplicated.`)
    }

    seenBoardIds.add(id)

    return { id, title }
  })
}

function normalizeActiveBoardId(value: unknown, boards: Board[]): BoardId {
  const activeBoardId = normalizeNonEmptyString(
    value,
    'Restore state activeBoardId must be a string.',
  )

  if (!boards.some((board) => board.id === activeBoardId)) {
    throw new KanbanRestoreError(
      `Restore state activeBoardId "${activeBoardId}" does not exist in boards.`,
    )
  }

  return activeBoardId
}

function normalizeColumnsByBoard(
  value: unknown,
  boards: Board[],
): Record<BoardId, Column[]> {
  const record = toRecord(value, 'Restore state columnsByBoard must be an object.')

  return Object.fromEntries(
    boards.map((board) => [board.id, normalizeColumns(record[board.id], board.id)]),
  ) as Record<BoardId, Column[]>
}

function normalizeColumns(value: unknown, boardId: BoardId): Column[] {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new KanbanRestoreError(`Columns for board "${boardId}" must be an array.`)
  }

  const seenColumnIds = new Set<string>()

  return value.map((column, index) => {
    const candidate = toRecord(
      column,
      `Column at index ${index} for board "${boardId}" must be an object.`,
    )
    const id = normalizeNonEmptyString(
      candidate.id,
      `Column at index ${index} for board "${boardId}" is missing an id.`,
    )
    const title = normalizeNonEmptyString(
      candidate.title,
      `Column "${id}" for board "${boardId}" must have a title.`,
    )

    if (seenColumnIds.has(id)) {
      throw new KanbanRestoreError(
        `Column id "${id}" is duplicated in board "${boardId}".`,
      )
    }

    seenColumnIds.add(id)

    return { id, title }
  })
}

function normalizeTasksByBoard(
  value: unknown,
  boards: Board[],
  columnsByBoard: Record<BoardId, Column[]>,
): TasksByBoard {
  const record = toRecord(value, 'Restore state tasksByBoard must be an object.')

  return Object.fromEntries(
    boards.map((board) => [
      board.id,
      normalizeTasksByColumn(record[board.id], board.id, columnsByBoard[board.id] ?? []),
    ]),
  ) as TasksByBoard
}

function normalizeTasksByColumn(
  value: unknown,
  boardId: BoardId,
  columns: Column[],
): TasksByColumn {
  if (value === undefined) {
    return Object.fromEntries(columns.map((column) => [column.id, []])) as TasksByColumn
  }

  const record = toRecord(value, `Tasks for board "${boardId}" must be an object.`)

  return Object.fromEntries(
    columns.map((column) => [
      column.id,
      normalizeTasks(record[column.id], boardId, column.id),
    ]),
  ) as TasksByColumn
}

function normalizeTasks(value: unknown, boardId: BoardId, columnId: ColumnId): Task[] {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new KanbanRestoreError(
      `Tasks for column "${columnId}" in board "${boardId}" must be an array.`,
    )
  }

  const seenTaskIds = new Set<string>()

  return value.map((task, index) => {
    const candidate = toRecord(
      task,
      `Task at index ${index} for column "${columnId}" in board "${boardId}" must be an object.`,
    )
    const id = normalizeNonEmptyString(
      candidate.id,
      `Task at index ${index} for column "${columnId}" in board "${boardId}" is missing an id.`,
    )
    const title = normalizeNonEmptyString(
      candidate.title,
      `Task "${id}" in column "${columnId}" must have a title.`,
    )
    const description = normalizeString(
      candidate.description,
      `Task "${id}" in column "${columnId}" must have a description string.`,
    )
    const dueDate = normalizeOptionalString(candidate.dueDate)

    if (seenTaskIds.has(id)) {
      throw new KanbanRestoreError(
        `Task id "${id}" is duplicated in column "${columnId}" of board "${boardId}".`,
      )
    }

    seenTaskIds.add(id)

    return {
      id,
      title,
      description,
      ...(dueDate ? { dueDate } : {}),
    }
  })
}

function normalizeNonEmptyString(value: unknown, message: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new KanbanRestoreError(message)
  }

  return value.trim()
}

function normalizeString(value: unknown, message: string): string {
  if (typeof value !== 'string') {
    throw new KanbanRestoreError(message)
  }

  return value
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new KanbanRestoreError('Task dueDate must be a string when provided.')
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function toRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new KanbanRestoreError(message)
  }

  return value as Record<string, unknown>
}
