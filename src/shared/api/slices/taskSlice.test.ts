import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BOARD_MAIN_ID,
  COLUMN_DONE_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
} from '@/test/fixtures/kanbanFixtures'
import {
  createTestKanbanStore,
  resetKanbanStore,
} from '@/test/helpers/storeTestUtils'

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-task-id'),
}))

describe('taskSlice', () => {
  const store = createTestKanbanStore()

  beforeEach(() => {
    resetKanbanStore(store)
  })

  describe('addTask', () => {
    it('appends_a_trimmed_task_to_the_target_column', () => {
      store.getState().addTask(COLUMN_TODO_ID, '  New task  ', '  Details  ')

      const created = store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].at(-1)
      expect(created).toEqual({
        id: 'generated-task-id',
        title: 'New task',
        description: 'Details',
      })
    })

    it('ignores_add_task_when_title_is_blank', () => {
      const before = store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].length

      store.getState().addTask(COLUMN_TODO_ID, '   ')

      expect(store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]).toHaveLength(
        before,
      )
    })
  })

  describe('updateTask', () => {
    it('updates_fields_for_an_existing_task', () => {
      store.getState().updateTask(COLUMN_TODO_ID, TASK_ALPHA_ID, {
        title: 'Updated alpha',
        description: 'Updated description',
      })

      const updated = store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].find(
        (task) => task.id === TASK_ALPHA_ID,
      )

      expect(updated).toMatchObject({
        id: TASK_ALPHA_ID,
        title: 'Updated alpha',
        description: 'Updated description',
      })
    })

    it('does_not_mutate_state_when_task_is_missing', () => {
      const before = store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]

      store.getState().updateTask(COLUMN_TODO_ID, 'missing-task', {
        title: 'Ghost',
      })

      expect(store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]).toEqual(before)
    })
  })

  describe('deleteTask', () => {
    it('removes_the_task_from_the_column', () => {
      store.getState().deleteTask(COLUMN_TODO_ID, TASK_BETA_ID)

      expect(
        store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].map((task) => task.id),
      ).toEqual([TASK_ALPHA_ID])
    })
  })

  describe('reorderTask', () => {
    it('moves_a_task_within_the_same_column', () => {
      store.getState().reorderTask(COLUMN_TODO_ID, 1, 0)

      expect(
        store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].map((task) => task.id),
      ).toEqual([TASK_BETA_ID, TASK_ALPHA_ID])
    })

    it('ignores_reorder_when_column_is_empty', () => {
      store.getState().reorderTask(COLUMN_DONE_ID, 0, 0)

      expect(store.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_DONE_ID]).toEqual([])
    })
  })
})
