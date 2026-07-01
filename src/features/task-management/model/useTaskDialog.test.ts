import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTaskDialog } from '@/features/task-management/model/useTaskDialog'
import {
  BOARD_MAIN_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  fixtureTasks,
} from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'
import { useKanbanStore } from '@/shared/api'

describe('useTaskDialog', () => {
  setupKanbanStore()

  describe('openForEdit', () => {
    it('opens_dialog_with_selected_task_context', () => {
      const task = fixtureTasks[COLUMN_TODO_ID][0]
      const { result } = renderHook(() => useTaskDialog())

      act(() => {
        result.current.openForEdit(task, COLUMN_TODO_ID)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.editingTask).toEqual(task)
      expect(result.current.editingColumnId).toBe(COLUMN_TODO_ID)
    })
  })

  describe('handleSave', () => {
    it('updates_existing_task_when_dialog_is_in_edit_mode', () => {
      const task = fixtureTasks[COLUMN_TODO_ID][0]
      const { result } = renderHook(() => useTaskDialog())

      act(() => {
        result.current.openForEdit(task, COLUMN_TODO_ID)
      })

      act(() => {
        result.current.handleSave('Edited alpha', 'Edited description', '')
      })

      const updated = useKanbanStore
        .getState()
        .tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]
        .find((item) => item.id === TASK_ALPHA_ID)

      expect(updated).toMatchObject({
        id: TASK_ALPHA_ID,
        title: 'Edited alpha',
        description: 'Edited description',
      })
      expect(updated?.dueDate).toBeUndefined()
    })
  })

  describe('handleDelete', () => {
    it('removes_task_from_store', () => {
      const { result } = renderHook(() => useTaskDialog())

      act(() => {
        result.current.handleDelete(COLUMN_TODO_ID, TASK_ALPHA_ID)
      })

      expect(
        useKanbanStore
          .getState()
          .tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID]
          .some((task) => task.id === TASK_ALPHA_ID),
      ).toBe(false)
    })
  })

  describe('close', () => {
    it('resets_dialog_state', () => {
      const task = fixtureTasks[COLUMN_TODO_ID][0]
      const { result } = renderHook(() => useTaskDialog())

      act(() => {
        result.current.openForEdit(task, COLUMN_TODO_ID)
      })

      act(() => {
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.editingTask).toBeNull()
      expect(result.current.editingColumnId).toBeNull()
    })
  })
})
