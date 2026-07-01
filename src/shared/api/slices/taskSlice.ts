import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { KanbanState, Task, TaskSlice } from './types'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

export const createTaskSlice: StateCreator<
  KanbanState,
  [],
  [],
  TaskSlice
> = (set) => ({
  tasks: {},

  addTask: (columnId, title, description = '') => {
    const trimmed = title.trim()
    if (!trimmed) {
      const t = useI18nStore.getState().t
      useToastStore.getState().addNotification('error', t('validation.title_required'))
      return
    }
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
    const t = useI18nStore.getState().t
    useToastStore.getState().addNotification('success', t('feedback.task_created'))
  },

  updateTask: (columnId, taskId, data) =>
    set((state) => {
      const columnTasks = state.tasks[columnId] ?? []
      const exists = columnTasks.some((t) => t.id === taskId)
      if (!exists) {
        const t = useI18nStore.getState().t
        useToastStore.getState().addNotification('error', t('validation.task_not_found'))
        return state
      }
      return {
        tasks: {
          ...state.tasks,
          [columnId]: columnTasks.map((task) =>
            task.id === taskId ? { ...task, ...data } : task,
          ),
        },
      }
    }),

  deleteTask: (columnId, taskId) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [columnId]: (state.tasks[columnId] ?? []).filter(
          (task) => task.id !== taskId,
        ),
      },
    }))
    const t = useI18nStore.getState().t
    useToastStore.getState().addNotification('info', t('feedback.task_deleted'))
  },

  reorderTask: (columnId, fromIndex, toIndex) =>
    set((state) => {
      const tasks = [...(state.tasks[columnId] ?? [])]
      if (tasks.length === 0) return state
      const [moved] = tasks.splice(fromIndex, 1)
      if (!moved) {
        const t = useI18nStore.getState().t
        useToastStore.getState().addNotification('error', t('validation.invalid_position'))
        return state
      }
      tasks.splice(toIndex, 0, moved)
      return {
        tasks: {
          ...state.tasks,
          [columnId]: tasks,
        },
      }
    }),
})
