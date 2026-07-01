import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useColumnActions } from '@/features/column-management/model/useColumnActions'
import {
  BOARD_MAIN_ID,
  COLUMN_DONE_ID,
  COLUMN_TODO_ID,
} from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'
import { useKanbanStore } from '@/shared/api'

describe('useColumnActions', () => {
  setupKanbanStore()

  describe('canDeleteColumn', () => {
    it('returns_true_when_column_has_no_tasks', () => {
      const { result } = renderHook(() => useColumnActions())

      expect(result.current.canDeleteColumn(COLUMN_DONE_ID)).toBe(true)
    })

    it('returns_false_when_column_has_tasks', () => {
      const { result } = renderHook(() => useColumnActions())

      expect(result.current.canDeleteColumn(COLUMN_TODO_ID)).toBe(false)
    })
  })

  describe('handleRename', () => {
    it('updates_column_title_when_value_is_valid', () => {
      const { result } = renderHook(() => useColumnActions())

      result.current.handleRename(COLUMN_TODO_ID, '  Backlog  ')

      const column = useKanbanStore
        .getState()
        .columnsByBoard[BOARD_MAIN_ID]
        .find((item) => item.id === COLUMN_TODO_ID)
      expect(column?.title).toBe('Backlog')
    })

    it('ignores_blank_titles', () => {
      const { result } = renderHook(() => useColumnActions())
      const before = useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID]

      result.current.handleRename(COLUMN_TODO_ID, '   ')

      expect(useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID]).toEqual(before)
    })
  })

  describe('handleDelete', () => {
    it('removes_the_column_from_store', () => {
      const { result } = renderHook(() => useColumnActions())

      result.current.handleDelete(COLUMN_DONE_ID)

      expect(
        useKanbanStore
          .getState()
          .columnsByBoard[BOARD_MAIN_ID]
          .some((column) => column.id === COLUMN_DONE_ID),
      ).toBe(false)
    })
  })
})
