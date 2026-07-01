import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { KanbanState } from './slices/types'
import { kanbanStoreCreator } from './storeCreator'
import { useToastStore } from '@/shared/ui'
import { useI18nStore } from '@/shared/i18n'

function createSafeStorage() {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name)
      } catch {
        return null
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value)
      } catch {
        const t = useI18nStore.getState().t
        useToastStore.getState().addNotification(
          'error',
          t('storage.save_error'),
        )
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name)
      } catch {
        // Non-critical — silently ignore
      }
    },
  }))
}

export const useKanbanStore = create<KanbanState>()(
  persist(kanbanStoreCreator, {
    name: 'kanban-board-storage',
    storage: createSafeStorage(),
  }),
)
