import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { KanbanState, Task, TaskSlice } from './types'
import {
  getActiveBoardId,
  getActiveBoardTasks,
  setActiveBoardTasks,
} from './helpers'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

export function createTaskSlice(
  initialState: Pick<KanbanState, 'tasksByBoard'>,
): StateCreator<KanbanState, [], [], TaskSlice> {
  return (set) => ({
    tasksByBoard: initialState.tasksByBoard,

    addTask: (columnId, title, description = '', dueDate) => {
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

        const boardTasks = getActiveBoardTasks(state)
        const newTask: Task = {
          id: nanoid(),
          title: trimmed,
          description: description.trim(),
          ...(dueDate ? { dueDate } : {}),
        }
        const columnTasks = boardTasks[columnId] ?? []

        return {
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...boardTasks,
            [columnId]: [...columnTasks, newTask],
          }),
        }
      })

      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('success', t('feedback.task_created'))
    },

    updateTask: (columnId, taskId, data) =>
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const boardTasks = getActiveBoardTasks(state)
        const columnTasks = boardTasks[columnId] ?? []
        const exists = columnTasks.some((task) => task.id === taskId)

        if (!exists) {
          const t = useI18nStore.getState().t
          useToastStore.getState().addNotification('error', t('validation.task_not_found'))
          return state
        }

        return {
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...boardTasks,
            [columnId]: columnTasks.map((task) =>
              task.id === taskId ? { ...task, ...data } : task,
            ),
          }),
        }
      }),

    deleteTask: (columnId, taskId) => {
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const boardTasks = getActiveBoardTasks(state)

        return {
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...boardTasks,
            [columnId]: (boardTasks[columnId] ?? []).filter(
              (task) => task.id !== taskId,
            ),
          }),
        }
      })

      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('info', t('feedback.task_deleted'))
    },

    reorderTask: (columnId, fromIndex, toIndex) =>
      set((state) => {
        const boardId = getActiveBoardId(state)
        if (!boardId) {
          return state
        }

        const boardTasks = getActiveBoardTasks(state)
        const tasks = [...(boardTasks[columnId] ?? [])]
        if (tasks.length === 0) return state

        const [moved] = tasks.splice(fromIndex, 1)
        if (!moved) {
          const t = useI18nStore.getState().t
          useToastStore.getState().addNotification('error', t('validation.invalid_position'))
          return state
        }

        tasks.splice(toIndex, 0, moved)

        return {
          tasksByBoard: setActiveBoardTasks(state.tasksByBoard, boardId, {
            ...boardTasks,
            [columnId]: tasks,
          }),
        }
      }),
  })
}
