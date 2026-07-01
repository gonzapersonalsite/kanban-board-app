import type { StateCreator } from 'zustand'
import type { DndSlice, KanbanState } from './types'
import {
  getActiveBoardColumns,
  getActiveBoardId,
  getActiveBoardTasks,
  setActiveBoardColumns,
  setActiveBoardTasks,
} from './helpers'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

export function createDndSlice(): StateCreator<KanbanState, [], [], DndSlice> {
  return (set) => ({
    reorderColumns: (fromIndex, toIndex) =>
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const columns = [...getActiveBoardColumns(state)]
        if (fromIndex < 0 || fromIndex >= columns.length) {
          const t = useI18nStore.getState().t
          useToastStore.getState().addNotification('error', t('validation.invalid_position'))
          return state
        }

        const [moved] = columns.splice(fromIndex, 1)
        if (!moved) {
          const t = useI18nStore.getState().t
          useToastStore.getState().addNotification('error', t('validation.invalid_position'))
          return state
        }

        const clamped = Math.max(0, Math.min(toIndex, columns.length))
        columns.splice(clamped, 0, moved)

        return {
          columnsByBoard: setActiveBoardColumns(
            state.columnsByBoard,
            boardId,
            columns,
          ),
        }
      }),

    moveTask: (sourceColId, destColId, taskId, newIndex) =>
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const boardTasks = getActiveBoardTasks(state)
        const sourceTasks = [...(boardTasks[sourceColId] ?? [])]
        const taskIndex = sourceTasks.findIndex((task) => task.id === taskId)

        if (taskIndex === -1) {
          const t = useI18nStore.getState().t
          useToastStore.getState().addNotification('error', t('validation.task_not_found'))
          return state
        }

        const [task] = sourceTasks.splice(taskIndex, 1)
        const destTasks =
          sourceColId === destColId
            ? sourceTasks
            : [...(boardTasks[destColId] ?? [])]

        destTasks.splice(newIndex, 0, task)

        return {
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...boardTasks,
            [sourceColId]: sourceTasks,
            [destColId]: destTasks,
          }),
        }
      }),
  })
}
