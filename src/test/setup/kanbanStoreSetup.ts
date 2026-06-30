import { beforeEach } from 'vitest'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'

export function setupKanbanStore() {
  beforeEach(() => {
    localStorage.clear()
    resetPersistedKanbanStore(useKanbanStore.setState)
  })
}
