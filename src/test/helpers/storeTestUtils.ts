import { create } from 'zustand'
import type { KanbanState } from '@/shared/api'
import { kanbanStoreCreator } from '@/shared/api/storeCreator'
import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'

export function createTestKanbanStore() {
  return create<KanbanState>()(kanbanStoreCreator)
}

export function resetKanbanStore(
  store: ReturnType<typeof createTestKanbanStore>,
) {
  const fixture = createKanbanFixture()
  store.setState({
    columns: fixture.columns,
    tasks: fixture.tasks,
  })
}

export function resetPersistedKanbanStore(
  setState: (partial: Pick<KanbanState, 'columns' | 'tasks'>) => void,
) {
  const fixture = createKanbanFixture()
  setState({
    columns: fixture.columns,
    tasks: fixture.tasks,
  })
}
