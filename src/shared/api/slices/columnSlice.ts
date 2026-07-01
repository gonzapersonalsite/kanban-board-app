import type { StateCreator } from 'zustand'
import { nanoid } from 'nanoid'
import type { ColumnSlice, KanbanState } from './types'
import {
  getActiveBoardColumns,
  getActiveBoardId,
  getActiveBoardTasks,
  removeBoardTasksByColumns,
  setActiveBoardColumns,
  setActiveBoardTasks,
} from './helpers'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

export function createColumnSlice(
  initialState: Pick<KanbanState, 'columnsByBoard'>,
): StateCreator<KanbanState, [], [], ColumnSlice> {
  return (set) => ({
    columnsByBoard: initialState.columnsByBoard,

    addColumn: (title) => {
      const trimmed = title.trim()
      if (!trimmed) {
        const t = useI18nStore.getState().t
        useToastStore.getState().addNotification('error', t('validation.title_required'))
        return
      }

      const id = nanoid()

      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const columns = getActiveBoardColumns(state)
        const tasks = getActiveBoardTasks(state)

        return {
          columnsByBoard: setActiveBoardColumns(state.columnsByBoard, boardId, [
            ...columns,
            { id, title: trimmed },
          ]),
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...tasks,
            [id]: [],
          }),
        }
      })

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

      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        return {
          columnsByBoard: setActiveBoardColumns(
            state.columnsByBoard,
            boardId,
            getActiveBoardColumns(state).map((col) =>
              col.id === id ? { ...col, title: trimmed } : col,
            ),
          ),
        }
      })
    },

    deleteColumn: (id) => {
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const columns = getActiveBoardColumns(state)
        const remainingColumns = columns.filter((col) => col.id !== id)

        if (remainingColumns.length === columns.length) {
          return state
        }

        const remainingTasks = removeBoardTasksByColumns(getActiveBoardTasks(state), [id])

        return {
          columnsByBoard: setActiveBoardColumns(
            state.columnsByBoard,
            boardId,
            remainingColumns,
          ),
          tasksByBoard: setActiveBoardTasks(
            state.tasksByBoard,
            boardId,
            remainingTasks,
          ),
        }
      })

      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('info', t('feedback.column_deleted'))
    },
  })
}
