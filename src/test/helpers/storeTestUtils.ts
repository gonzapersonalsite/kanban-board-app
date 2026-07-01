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
    boards: fixture.boards,
    activeBoardId: fixture.activeBoardId,
    columnsByBoard: fixture.columnsByBoard,
    tasksByBoard: fixture.tasksByBoard,
  })
}

export function resetPersistedKanbanStore(
  setState: (
    partial: Pick<
      KanbanState,
      'boards' | 'activeBoardId' | 'columnsByBoard' | 'tasksByBoard'
    >,
  ) => void,
) {
  const fixture = createKanbanFixture()
  setState({
    boards: fixture.boards,
    activeBoardId: fixture.activeBoardId,
    columnsByBoard: fixture.columnsByBoard,
    tasksByBoard: fixture.tasksByBoard,
  })
}
