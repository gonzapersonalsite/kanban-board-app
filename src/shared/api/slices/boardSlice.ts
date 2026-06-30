import type { StateCreator } from 'zustand'
import type { BoardSlice, KanbanState } from './types'

export const createBoardSlice: StateCreator<
  KanbanState,
  [],
  [],
  BoardSlice
> = (set) => ({
  reorderColumns: (fromIndex, toIndex) =>
    set((state) => {
      if (fromIndex < 0 || fromIndex >= state.columns.length) return state
      const columns = [...state.columns]
      const [moved] = columns.splice(fromIndex, 1)
      if (!moved) return state
      const clamped = Math.max(0, Math.min(toIndex, columns.length))
      columns.splice(clamped, 0, moved)
      return { columns }
    }),

  moveTask: (sourceColId, destColId, taskId, newIndex) =>
    set((state) => {
      const sourceTasks = [...(state.tasks[sourceColId] ?? [])]
      const taskIndex = sourceTasks.findIndex((t) => t.id === taskId)

      if (taskIndex === -1) return state

      const [task] = sourceTasks.splice(taskIndex, 1)

      const destTasks =
        sourceColId === destColId
          ? sourceTasks
          : [...(state.tasks[destColId] ?? [])]

      destTasks.splice(newIndex, 0, task)

      return {
        tasks: {
          ...state.tasks,
          [sourceColId]: sourceTasks,
          [destColId]: destTasks,
        },
      }
    }),
})
