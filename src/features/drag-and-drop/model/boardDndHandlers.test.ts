import { describe, expect, it } from 'vitest'
import {
  applyTaskDragOver,
  cloneTasksSnapshot,
  resolveTasksAfterDragEnd,
} from '@/features/drag-and-drop/model/boardDndHandlers'
import {
  COLUMN_DONE_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
  TASK_GAMMA_ID,
  fixtureTasks,
} from '@/test/fixtures/kanbanFixtures'
import {
  createCanceledTaskDragEndEvent,
  createCompletedTaskDragEndEvent,
  dragFixtures,
} from '@/test/helpers/dndEventFactory'

describe('boardDndHandlers', () => {
  describe('cloneTasksSnapshot', () => {
    it('creates_a_deep_copy_of_tasks', () => {
      const snapshot = cloneTasksSnapshot(fixtureTasks)

      snapshot[COLUMN_TODO_ID][0].title = 'Changed'

      expect(fixtureTasks[COLUMN_TODO_ID][0].title).toBe('Alpha')
    })
  })

  describe('applyTaskDragOver', () => {
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

  describe('resolveTasksAfterDragEnd', () => {
    it('restores_snapshot_when_drag_is_canceled', () => {
      const snapshot = cloneTasksSnapshot(fixtureTasks)
      const mutated = applyTaskDragOver(fixtureTasks, dragFixtures.moveAlphaToProgress())

      const resolved = resolveTasksAfterDragEnd(
        snapshot,
        createCanceledTaskDragEndEvent(),
        mutated,
      )

      expect(resolved).toEqual(snapshot)
    })

    it('keeps_current_tasks_when_drag_completes_successfully', () => {
      const snapshot = cloneTasksSnapshot(fixtureTasks)
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
