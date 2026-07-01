import type { StateCreator } from 'zustand'
import { createBoardSlice } from './slices/boardSlice'
import { createColumnSlice } from './slices/columnSlice'
import { createTaskSlice } from './slices/taskSlice'
import type { KanbanState, Task } from './slices/types'

export const kanbanStoreCreator: StateCreator<KanbanState> = (...args) => {
  const columnSlice = createColumnSlice(...args)
  const taskSlice = createTaskSlice(...args)
  const boardSlice = createBoardSlice(...args)

  const tasks: Record<string, Task[]> = { ...taskSlice.tasks }
  columnSlice.columns.forEach((col) => {
    if (!(col.id in tasks)) {
      tasks[col.id] = []
    }
  })

  return {
    ...columnSlice,
    ...taskSlice,
    ...boardSlice,
    tasks,
  }
}
