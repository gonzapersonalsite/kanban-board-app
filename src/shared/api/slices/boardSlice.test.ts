import { beforeEach, describe, expect, it } from 'vitest'
import {
  BOARD_MAIN_ID,
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

  describe('addBoard', () => {
    it('creates_a_new_board_and_makes_it_active', () => {
      const before = store.getState().boards.length

      store.getState().addBoard('  Product Roadmap  ')

      const state = store.getState()
      const created = state.boards.at(-1)

      expect(state.boards).toHaveLength(before + 1)
      expect(created?.title).toBe('Product Roadmap')
      expect(state.activeBoardId).toBe(created?.id)
      expect(created?.id ? state.columnsByBoard[created.id] : undefined).toHaveLength(3)
      expect(created?.id ? state.tasksByBoard[created.id] : undefined).toBeTruthy()
    })
  })

  describe('updateBoard', () => {
    it('updates_the_matching_board_title', () => {
      store.getState().updateBoard(BOARD_MAIN_ID, '  Backlog Board  ')

      expect(store.getState().boards.find((board) => board.id === BOARD_MAIN_ID)?.title).toBe(
        'Backlog Board',
      )
    })

    it('ignores_blank_titles', () => {
      const before = createKanbanFixture().boards

      store.getState().updateBoard(BOARD_MAIN_ID, '   ')

      expect(store.getState().boards).toEqual(before)
    })
  })

  describe('deleteBoard', () => {
    it('removes_a_non_active_board_and_keeps_the_active_one', () => {
      store.getState().addBoard('Secondary')
      const secondaryBoardId = store.getState().activeBoardId!
      store.getState().setActiveBoard(BOARD_MAIN_ID)

      store.getState().deleteBoard(secondaryBoardId)

      const state = store.getState()
      expect(state.boards.some((board) => board.id === secondaryBoardId)).toBe(false)
      expect(state.columnsByBoard[secondaryBoardId]).toBeUndefined()
      expect(state.tasksByBoard[secondaryBoardId]).toBeUndefined()
      expect(state.activeBoardId).toBe(BOARD_MAIN_ID)
    })

    it('selects_another_board_when_deleting_the_active_one', () => {
      store.getState().addBoard('Secondary')
      const secondaryBoardId = store.getState().activeBoardId!

      store.getState().deleteBoard(secondaryBoardId)

      expect(store.getState().activeBoardId).toBe(BOARD_MAIN_ID)
    })

    it('does_not_delete_the_last_remaining_board', () => {
      const before = createKanbanFixture()

      store.getState().deleteBoard(BOARD_MAIN_ID)

      expect(store.getState().boards).toEqual(before.boards)
      expect(store.getState().activeBoardId).toBe(before.activeBoardId)
    })
  })

  describe('setActiveBoard', () => {
    it('changes_the_active_board_when_it_exists', () => {
      store.getState().addBoard('Secondary')
      const secondaryBoardId = store.getState().activeBoardId!

      store.getState().setActiveBoard(BOARD_MAIN_ID)
      expect(store.getState().activeBoardId).toBe(BOARD_MAIN_ID)

      store.getState().setActiveBoard(secondaryBoardId)
      expect(store.getState().activeBoardId).toBe(secondaryBoardId)
    })
  })
})
