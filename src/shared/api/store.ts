import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { KanbanState } from './slices/types'
import { kanbanStoreCreator } from './storeCreator'

export const useKanbanStore = create<KanbanState>()(
  persist(kanbanStoreCreator, {
    name: 'kanban-board-storage',
    storage: createJSONStorage(() => localStorage),
  }),
)
