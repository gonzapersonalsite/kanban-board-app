import type { StateCreator } from 'zustand'
import { createBoardSlice } from './slices/boardSlice'
import { createColumnSlice } from './slices/columnSlice'
import { createTaskSlice } from './slices/taskSlice'
import type { KanbanState } from './slices/types'

export const kanbanStoreCreator: StateCreator<KanbanState> = (...args) => ({
  ...createColumnSlice(...args),
  ...createTaskSlice(...args),
  ...createBoardSlice(...args),
})
