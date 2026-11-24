import { create } from 'zustand'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import type { KanbanState } from './slices/types'
import type { Column, Task, TasksByColumn } from './slices/types'
import { getDefaultBoardTitle, normalizeTaskMap, normalizeTasksByColumn } from './slices/helpers'
import { isCalendarDay } from './dueDate'
import { createSampleBoardLifecycle } from './sampleBoard'
import { kanbanStoreCreator } from './storeCreator'
import { useToastStore } from '@/shared/toast'
import { useI18nStore } from '@/shared/i18n'
import { nanoid } from 'nanoid'

export const KANBAN_STORAGE_KEY = 'kanban-board-storage'
// What is stored under an older version goes through migrateKanbanState once and is stored again.
export const KANBAN_STORAGE_VERSION = 2

export function createSafeStorage(): PersistStorage<Partial<KanbanState>> {
  return {
    getItem: (name: string) => {
      try {
        const storedValue = localStorage.getItem(name)
        if (!storedValue) {
          return null
        }

        return JSON.parse(storedValue) as StorageValue<Partial<KanbanState>>
      } catch {
        notifyStorageError('load_error')

        try {
          localStorage.removeItem(name)
        } catch {
          // Best-effort cleanup only.
        }

        return null
      }
    },
    setItem: (name: string, value: StorageValue<Partial<KanbanState>>) => {
      try {
        localStorage.setItem(name, JSON.stringify(value))
      } catch {
        notifyStorageError('save_error')
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name)
      } catch {
        // Non-critical — silently ignore
      }
    },
  }
}

function notifyStorageError(key: 'load_error' | 'save_error') {
  const t = useI18nStore.getState().t
  useToastStore.getState().addNotification('error', t(`storage.${key}`))
}

const sampleBoard = createSampleBoardLifecycle()

export const useKanbanStore = create<KanbanState>()(
  persist(kanbanStoreCreator, {
    name: KANBAN_STORAGE_KEY,
    version: KANBAN_STORAGE_VERSION,
    storage: sampleBoard.skipUntouchedSampleWrites(createSafeStorage()),
    migrate: (persistedState, version) => migrateKanbanState(persistedState, version),
  }),
)

sampleBoard.followLocale(useKanbanStore)

type LegacyKanbanState = {
  columns: Column[]
  tasks: TasksByColumn
}

export function migrateKanbanState(persistedState: unknown, version: number): Partial<KanbanState> {
  const state = toMultiBoardState(persistedState, version)

  return version < 2 ? withoutDueDatesNoScreenCanShow(state) : state
}

// Version 2. A due date stored before the store refused it leaves its board unable to render, here
// and after every reload: the task stays and its date goes. #a-due-date-is-a-day-of-the-calendar
function withoutDueDatesNoScreenCanShow(state: Partial<KanbanState>): Partial<KanbanState> {
  if (!state || typeof state.tasksByBoard !== 'object' || state.tasksByBoard === null) {
    return state
  }

  return {
    ...state,
    tasksByBoard: mapValues(state.tasksByBoard, (tasksByColumn) =>
      mapValues(tasksByColumn ?? {}, (tasks) => (Array.isArray(tasks) ? tasks.map(withoutUnshowableDueDate) : tasks)),
    ),
  }
}

function withoutUnshowableDueDate(task: Task): Task {
  if (!task || task.dueDate === undefined || (typeof task.dueDate === 'string' && isCalendarDay(task.dueDate))) {
    return task
  }

  const rest = { ...task }
  delete rest.dueDate
  return rest
}

function mapValues<Value>(record: Record<string, Value>, change: (value: Value) => Value): Record<string, Value> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, change(value)]))
}

function toMultiBoardState(persistedState: unknown, version: number): Partial<KanbanState> {
  if (version >= 1 && isMultiBoardState(persistedState)) {
    return persistedState
  }

  if (isLegacyState(persistedState)) {
    const boardId = nanoid()
    const columns = persistedState.columns.map((column) => ({ ...column }))
    const tasks = normalizeTasksByColumn(columns, normalizeTaskMap(persistedState.tasks))

    return {
      boards: [
        {
          id: boardId,
          title: getDefaultBoardTitle(),
        },
      ],
      activeBoardId: boardId,
      columnsByBoard: {
        [boardId]: columns,
      },
      tasksByBoard: {
        [boardId]: tasks,
      },
    }
  }

  return persistedState as Partial<KanbanState>
}

function isLegacyState(value: unknown): value is LegacyKanbanState {
  if (!value || typeof value !== 'object') {
    return false
  }

  return Array.isArray((value as { columns?: unknown }).columns)
}

function isMultiBoardState(value: unknown): value is Partial<KanbanState> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as {
    boards?: unknown
    columnsByBoard?: unknown
    tasksByBoard?: unknown
  }

  return (
    Array.isArray(candidate.boards) &&
    !!candidate.columnsByBoard &&
    typeof candidate.columnsByBoard === 'object' &&
    !!candidate.tasksByBoard &&
    typeof candidate.tasksByBoard === 'object'
  )
}
