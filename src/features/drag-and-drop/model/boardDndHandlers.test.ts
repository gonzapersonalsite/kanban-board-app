import { describe, expect, it } from 'vitest'
import {
  applyColumnDragOver,
  applyTaskDragOver,
  resolveTasksAfterDragEnd,
} from '@/features/drag-and-drop/model/boardDndHandlers'
import {
  COLUMN_DONE_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
  TASK_GAMMA_ID,
  fixtureColumns,
  fixtureTasks,
} from '@/test/fixtures/kanbanFixtures'
import {
  createCanceledTaskDragEndEvent,
  createCompletedTaskDragEndEvent,
  dragFixtures,
} from '@/test/helpers/dndEventFactory'

describe('boardDndHandlers', () => {
  describe('applyTaskDragOver', () => {
    it('leaves_the_input_tasks_untouched_when_moving_a_task', () => {
      const before = structuredClone(fixtureTasks)

      applyTaskDragOver(fixtureTasks, dragFixtures.moveAlphaToProgress())

      expect(fixtureTasks).toEqual(before)
    })

    it('returns_the_same_tasks_when_a_task_is_over_itself', () => {
      const nextTasks = applyTaskDragOver(fixtureTasks, dragFixtures.alphaOverItself())

      expect(nextTasks).toBe(fixtureTasks)
    })

    it('moves_a_task_to_another_column', () => {
      const nextTasks = applyTaskDragOver(
        fixtureTasks,
        dragFixtures.moveAlphaToProgress(),
      )

      expect(nextTasks[COLUMN_TODO_ID].map((task) => task.id)).toEqual([
        TASK_BETA_ID,
      ])
      expect(nextTasks[COLUMN_PROGRESS_ID].map((task) => task.id)).toEqual([
        TASK_GAMMA_ID,
        TASK_ALPHA_ID,
      ])
    })

    it('reorders_tasks_within_the_same_column', () => {
      const nextTasks = applyTaskDragOver(
        fixtureTasks,
        dragFixtures.moveBetaWithinTodo(),
      )

      expect(nextTasks[COLUMN_TODO_ID].map((task) => task.id)).toEqual([
        TASK_BETA_ID,
        TASK_ALPHA_ID,
      ])
    })

    it('moves_a_task_into_an_empty_column', () => {
      const nextTasks = applyTaskDragOver(
        fixtureTasks,
        dragFixtures.moveGammaToDone(),
      )

      expect(nextTasks[COLUMN_PROGRESS_ID]).toEqual([])
      expect(nextTasks[COLUMN_DONE_ID].map((task) => task.id)).toEqual([
        TASK_GAMMA_ID,
      ])
    })
  })

  describe('applyColumnDragOver', () => {
    it('returns_the_same_columns_when_a_column_is_over_itself', () => {
      const nextColumns = applyColumnDragOver(fixtureColumns, dragFixtures.todoColumnOverItself())

      expect(nextColumns).toBe(fixtureColumns)
    })
  })

  describe('resolveTasksAfterDragEnd', () => {
    it('restores_snapshot_when_drag_is_canceled', () => {
      const snapshot = fixtureTasks
      const mutated = applyTaskDragOver(fixtureTasks, dragFixtures.moveAlphaToProgress())

      const resolved = resolveTasksAfterDragEnd(
        snapshot,
        createCanceledTaskDragEndEvent(),
        mutated,
      )

      expect(resolved).toBe(snapshot)
    })

    it('keeps_current_tasks_when_drag_completes_successfully', () => {
      const snapshot = fixtureTasks
      const mutated = applyTaskDragOver(fixtureTasks, dragFixtures.moveAlphaToProgress())

      const resolved = resolveTasksAfterDragEnd(
        snapshot,
        createCompletedTaskDragEndEvent(),
        mutated,
      )

      expect(resolved).toEqual(mutated)
    })
  })
})
