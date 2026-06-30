import { beforeEach, describe, expect, it } from 'vitest'
import {
  COLUMN_DONE_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
  createKanbanFixture,
} from '@/test/fixtures/kanbanFixtures'
import {
  createTestKanbanStore,
  resetKanbanStore,
} from '@/test/helpers/storeTestUtils'

describe('boardSlice', () => {
  const store = createTestKanbanStore()

  beforeEach(() => {
    resetKanbanStore(store)
  })

  describe('reorderColumns', () => {
    it('moves_a_column_to_a_new_position', () => {
      const initial = store.getState().columns.map((column) => column.id)

      store.getState().reorderColumns(0, 2)

      const next = store.getState().columns.map((column) => column.id)
      expect(next).toEqual([initial[1], initial[2], initial[0]])
    })

    it('ignores_reorder_when_source_index_is_out_of_bounds', () => {
      const initial = store.getState().columns

      store.getState().reorderColumns(-1, 1)

      expect(store.getState().columns).toEqual(initial)
    })
  })

  describe('moveTask', () => {
    it('moves_a_task_to_another_column_at_the_requested_index', () => {
      store.getState().moveTask(COLUMN_TODO_ID, COLUMN_DONE_ID, TASK_ALPHA_ID, 0)

      const tasks = store.getState().tasks
      expect(tasks[COLUMN_TODO_ID].map((task) => task.id)).toEqual([
        TASK_BETA_ID,
      ])
      expect(tasks[COLUMN_DONE_ID].map((task) => task.id)).toEqual([
        TASK_ALPHA_ID,
      ])
    })

    it('reorders_a_task_within_the_same_column', () => {
      store.getState().moveTask(COLUMN_TODO_ID, COLUMN_TODO_ID, TASK_BETA_ID, 0)

      expect(store.getState().tasks[COLUMN_TODO_ID].map((task) => task.id)).toEqual(
        [TASK_BETA_ID, TASK_ALPHA_ID],
      )
    })

    it('does_not_mutate_state_when_task_id_is_missing', () => {
      const before = createKanbanFixture().tasks

      store.getState().moveTask(COLUMN_TODO_ID, COLUMN_DONE_ID, 'missing-task', 0)

      expect(store.getState().tasks).toEqual(before)
    })
  })
})
