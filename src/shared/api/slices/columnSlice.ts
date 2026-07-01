import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { Column } from './types'
import type { ColumnSlice, KanbanState } from './types'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

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
    if (!trimmed) {
      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('error', t('validation.title_required'))
      return
    }
    const id = nanoid()
    set((state) => ({
      columns: [...state.columns, { id, title: trimmed }],
      tasks: { ...state.tasks, [id]: [] },
    }))
    const t = useI18nStore.getState().t
    useToastStore.getState().addNotification('success', t('feedback.column_created'))
  },

  updateColumn: (id, title) => {
    const trimmed = title.trim()
    if (!trimmed) {
      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('error', t('validation.title_required'))
      return
    }
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, title: trimmed } : col,
      ),
    }))
  },

  deleteColumn: (id) => {
    set((state) => {
      const remainingTasks = { ...state.tasks }
      delete remainingTasks[id]
      return {
        columns: state.columns.filter((col) => col.id !== id),
        tasks: remainingTasks,
      }
    })
    const t = useI18nStore.getState().t
    useToastStore.getState().addNotification('info', t('feedback.column_deleted'))
  },
})
