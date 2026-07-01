import type { StateCreator } from 'zustand'
import { createBoardSlice } from './slices/boardSlice'
import { createColumnSlice } from './slices/columnSlice'
import { createDndSlice } from './slices/dndSlice'
import { createInitialKanbanState } from './slices/helpers'
import { createTaskSlice } from './slices/taskSlice'
import type { KanbanState } from './slices/types'

export const kanbanStoreCreator: StateCreator<KanbanState> = (...args) => {
  const initialState = createInitialKanbanState()
  const boardSlice = createBoardSlice({
    boards: initialState.boards,
    activeBoardId: initialState.activeBoardId,
  })(...args)
  const columnSlice = createColumnSlice({
    columnsByBoard: initialState.columnsByBoard,
  })(...args)
  const taskSlice = createTaskSlice({
    tasksByBoard: initialState.tasksByBoard,
  })(...args)
  const dndSlice = createDndSlice()(...args)

  return {
    ...boardSlice,
    ...columnSlice,
    ...taskSlice,
    ...dndSlice,
  }
}
