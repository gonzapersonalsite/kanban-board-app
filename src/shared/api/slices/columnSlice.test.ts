import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BOARD_MAIN_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  createKanbanFixture,
} from '@/test/fixtures/kanbanFixtures'
import {
  createTestKanbanStore,
  resetKanbanStore,
} from '@/test/helpers/storeTestUtils'

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-column-id'),
}))

describe('columnSlice', () => {
  const store = createTestKanbanStore()

  beforeEach(() => {
    resetKanbanStore(store)
  })

  describe('addColumn', () => {
    it('creates_a_column_with_trimmed_title_and_empty_tasks', () => {
      store.getState().addColumn('  Review  ')

      const state = store.getState()
      const created = state.columnsByBoard[BOARD_MAIN_ID].find(
        (column) => column.id === 'generated-column-id',
      )

      expect(created).toEqual({ id: 'generated-column-id', title: 'Review' })
      expect(state.tasksByBoard[BOARD_MAIN_ID]['generated-column-id']).toEqual([])
    })

    it('ignores_add_column_when_title_is_blank', () => {
      const before = store.getState().columnsByBoard[BOARD_MAIN_ID].length

      store.getState().addColumn('   ')

      expect(store.getState().columnsByBoard[BOARD_MAIN_ID]).toHaveLength(before)
    })
  })

  describe('updateColumn', () => {
    it('updates_the_matching_column_title', () => {
      store.getState().updateColumn(COLUMN_TODO_ID, '  Backlog  ')

      const updated = store.getState().columnsByBoard[BOARD_MAIN_ID].find(
        (column) => column.id === COLUMN_TODO_ID,
      )

      expect(updated?.title).toBe('Backlog')
    })

    it('ignores_update_when_title_is_blank', () => {
      const before = store.getState().columnsByBoard[BOARD_MAIN_ID]

      store.getState().updateColumn(COLUMN_TODO_ID, '   ')

      expect(store.getState().columnsByBoard[BOARD_MAIN_ID]).toEqual(before)
    })
  })

  describe('deleteColumn', () => {
    it('removes_the_column_and_its_tasks', () => {
      store.getState().deleteColumn(COLUMN_TODO_ID)

      const state = store.getState()
      expect(
        state.columnsByBoard[BOARD_MAIN_ID].some((column) => column.id === COLUMN_TODO_ID),
      ).toBe(false)
      expect(state.tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]).toBeUndefined()
    })

    it('preserves_unrelated_columns_and_tasks', () => {
      const before = createKanbanFixture()

      store.getState().deleteColumn(COLUMN_TODO_ID)

      const state = store.getState()
      expect(state.columnsByBoard[BOARD_MAIN_ID]).toEqual(
        before.columnsByBoard[BOARD_MAIN_ID].filter(
          (column) => column.id !== COLUMN_TODO_ID,
        ),
      )
      expect(state.tasksByBoard[BOARD_MAIN_ID][COLUMN_PROGRESS_ID]).toEqual(
        before.tasksByBoard[BOARD_MAIN_ID][COLUMN_PROGRESS_ID],
      )
    })
  })
})
