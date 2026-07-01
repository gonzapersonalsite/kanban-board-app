import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBoards } from './useBoards'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'

describe('useBoards', () => {
  setupKanbanStore()

  it('returns_the_current_board_state', () => {
    const { result } = renderHook(() => useBoards())

    expect(result.current.activeBoardId).toBe(BOARD_MAIN_ID)
    expect(result.current.activeBoard?.id).toBe(BOARD_MAIN_ID)
    expect(result.current.boards).toHaveLength(1)
  })

  it('creates_and_switches_to_a_new_board', () => {
    const { result } = renderHook(() => useBoards())

    act(() => {
      result.current.addBoard('Secondary')
    })

    expect(result.current.boards.some((board) => board.title === 'Secondary')).toBe(true)
    expect(result.current.activeBoard?.title).toBe('Secondary')
  })

  it('renames_and_deletes_a_board', () => {
    const { result } = renderHook(() => useBoards())

    act(() => {
      result.current.addBoard('Secondary')
    })

    const secondaryBoardId = result.current.activeBoardId!

    act(() => {
      result.current.updateBoard(secondaryBoardId, 'Renamed Board')
    })

    expect(result.current.activeBoard?.title).toBe('Renamed Board')

    act(() => {
      result.current.deleteBoard(secondaryBoardId)
    })

    expect(result.current.boards).toHaveLength(1)
    expect(result.current.activeBoardId).toBe(BOARD_MAIN_ID)
  })
})
