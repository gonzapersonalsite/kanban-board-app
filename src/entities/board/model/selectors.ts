import type { Board, Column, KanbanState, TasksByColumn } from '@/shared/api'

export interface ActiveBoardState {
  board: Board | null
  columns: Column[]
  tasks: TasksByColumn
}

type BoardSelectionState = Pick<
  KanbanState,
  'boards' | 'activeBoardId' | 'columnsByBoard' | 'tasksByBoard'
>

export const selectActiveBoard = (state: BoardSelectionState): Board | null =>
  state.activeBoardId
    ? state.boards.find((board) => board.id === state.activeBoardId) ?? null
    : null

export const selectActiveBoardColumns = (state: BoardSelectionState): Column[] =>
  state.activeBoardId ? (state.columnsByBoard[state.activeBoardId] ?? []) : []

export const selectActiveBoardTasks = (state: BoardSelectionState): TasksByColumn =>
  state.activeBoardId ? (state.tasksByBoard[state.activeBoardId] ?? {}) : {}

export const selectActiveBoardState = (state: BoardSelectionState): ActiveBoardState => ({
  board: selectActiveBoard(state),
  columns: selectActiveBoardColumns(state),
  tasks: selectActiveBoardTasks(state),
})
