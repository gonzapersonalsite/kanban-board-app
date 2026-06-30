import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { KanbanState, Task, TaskSlice } from './types'

export const createTaskSlice: StateCreator<
  KanbanState,
  [],
  [],
  TaskSlice
> = (set) => ({
  tasks: {},

  addTask: (columnId, title, description = '') => {
    const trimmed = title.trim()
    if (!trimmed) return
    set((state) => {
      const newTask: Task = {
        id: nanoid(),
        title: trimmed,
        description: description.trim(),
      }
      const columnTasks = state.tasks[columnId] ?? []
      return {
        tasks: {
          ...state.tasks,
          [columnId]: [...columnTasks, newTask],
        },
      }
    })
  },

  updateTask: (columnId, taskId, data) =>
    set((state) => {
      const columnTasks = state.tasks[columnId] ?? []
      const exists = columnTasks.some((t) => t.id === taskId)
      if (!exists) return state
      return {
        tasks: {
          ...state.tasks,
          [columnId]: columnTasks.map((task) =>
            task.id === taskId ? { ...task, ...data } : task,
          ),
        },
      }
    }),

  deleteTask: (columnId, taskId) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [columnId]: (state.tasks[columnId] ?? []).filter(
          (task) => task.id !== taskId,
        ),
      },
    })),

  reorderTask: (columnId, fromIndex, toIndex) =>
    set((state) => {
      const tasks = [...(state.tasks[columnId] ?? [])]
      if (tasks.length === 0) return state
      const [moved] = tasks.splice(fromIndex, 1)
      if (!moved) return state
      tasks.splice(toIndex, 0, moved)
      return {
        tasks: {
          ...state.tasks,
          [columnId]: tasks,
        },
      }
    }),
})
