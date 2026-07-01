import { create } from 'zustand'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import type { KanbanState } from './slices/types'
import type { Column, TasksByColumn } from './slices/types'
import { getDefaultBoardTitle, normalizeTaskMap, normalizeTasksByColumn } from './slices/helpers'
import { kanbanStoreCreator } from './storeCreator'
import { useToastStore } from '@/shared/ui'
import { useI18nStore } from '@/shared/i18n'
import { nanoid } from 'nanoid'

export const KANBAN_STORAGE_KEY = 'kanban-board-storage'

export function createSafeStorage(): PersistStorage<KanbanState> {
  return {
    getItem: (name: string) => {
      try {
        const storedValue = localStorage.getItem(name)
        if (!storedValue) {
          return null
        }

        return JSON.parse(storedValue) as StorageValue<KanbanState>
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
    setItem: (name: string, value: StorageValue<KanbanState>) => {
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

export const useKanbanStore = create<KanbanState>()(
  persist(kanbanStoreCreator, {
    name: KANBAN_STORAGE_KEY,
    version: 1,
    storage: createSafeStorage(),
    migrate: (persistedState, version) => migrateKanbanState(persistedState, version),
  }),
)

type LegacyKanbanState = {
  columns: Column[]
  tasks: TasksByColumn
}

export function migrateKanbanState(
  persistedState: unknown,
  version: number,
): KanbanState | Partial<KanbanState> {
  if (version >= 1 && isMultiBoardState(persistedState)) {
    return persistedState
  }

  if (isLegacyState(persistedState)) {
    const boardId = nanoid()
    const columns = persistedState.columns.map((column) => ({ ...column }))
    const tasks = normalizeTasksByColumn(
      columns,
      normalizeTaskMap(persistedState.tasks),
    )

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
