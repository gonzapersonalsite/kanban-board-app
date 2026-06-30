import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBoard } from '@/widgets/board/model/useBoard'
import {
  COLUMN_DONE_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
} from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'

describe('useBoard', () => {
  setupKanbanStore()

  describe('getColumnTasks', () => {
    it('returns_tasks_for_existing_column', () => {
      const { result } = renderHook(() => useBoard())

      expect(result.current.getColumnTasks(COLUMN_TODO_ID)).toHaveLength(2)
    })

    it('returns_empty_array_for_unknown_column', () => {
      const { result } = renderHook(() => useBoard())

      expect(result.current.getColumnTasks('missing-column')).toEqual([])
    })
  })

  describe('hasTasks', () => {
    it('returns_true_when_column_contains_tasks', () => {
      const { result } = renderHook(() => useBoard())

      expect(result.current.hasTasks(COLUMN_TODO_ID)).toBe(true)
    })

    it('returns_false_when_column_is_empty', () => {
      const { result } = renderHook(() => useBoard())

      expect(result.current.hasTasks(COLUMN_DONE_ID)).toBe(false)
    })
  })

  describe('taskDialog integration', () => {
    it('exposes_task_dialog_handlers', () => {
      const { result } = renderHook(() => useBoard())

      expect(result.current.taskDialog.openForEdit).toBeTypeOf('function')
      expect(result.current.taskDialog.handleSave).toBeTypeOf('function')
      expect(result.current.getColumnTasks(COLUMN_TODO_ID)[0]?.id).toBe(
        TASK_ALPHA_ID,
      )
    })
  })
})
