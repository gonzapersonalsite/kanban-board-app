import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { Column } from './types'
import type { ColumnSlice, KanbanState } from './types'
import { useI18nStore } from '@/shared/i18n'

function getSeedColumns(): Column[] {
  const t = useI18nStore.getState().t
  return [
    { id: nanoid(), title: t('seed.column_todo') },
    { id: nanoid(), title: t('seed.column_in_progress') },
    { id: nanoid(), title: t('seed.column_done') },
  ]
}

export const createColumnSlice: StateCreator<
  KanbanState,
  [],
  [],
  ColumnSlice
> = (set) => ({
  columns: getSeedColumns(),

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
