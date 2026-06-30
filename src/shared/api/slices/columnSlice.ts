import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { ColumnSlice, KanbanState } from './types'

const seedColumns = [
  { id: nanoid(), title: 'To Do' },
  { id: nanoid(), title: 'In Progress' },
  { id: nanoid(), title: 'Done' },
]

export const createColumnSlice: StateCreator<
  KanbanState,
  [],
  [],
  ColumnSlice
> = (set) => ({
  columns: seedColumns,

  addColumn: (title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const id = nanoid()
    set((state) => ({
      columns: [...state.columns, { id, title: trimmed }],
      tasks: { ...state.tasks, [id]: [] },
    }))
  },

  updateColumn: (id, title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, title: trimmed } : col,
      ),
    }))
  },

  deleteColumn: (id) =>
    set((state) => {
      const remainingTasks = { ...state.tasks }
      delete remainingTasks[id]
      return {
        columns: state.columns.filter((col) => col.id !== id),
        tasks: remainingTasks,
      }
    }),
})
