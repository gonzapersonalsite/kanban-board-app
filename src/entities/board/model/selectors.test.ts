import { describe, expect, it } from 'vitest'
import {
  BOARD_MAIN_ID,
  createKanbanFixture,
} from '@/test/fixtures/kanbanFixtures'
import {
  selectActiveBoard,
  selectActiveBoardColumns,
  selectActiveBoardState,
  selectActiveBoardTasks,
} from './selectors'

describe('board selectors', () => {
  it('returns_the_active_board', () => {
    const state = createKanbanFixture()

    expect(selectActiveBoard(state)?.id).toBe(BOARD_MAIN_ID)
  })

  it('returns_columns_and_tasks_for_the_active_board', () => {
    const state = createKanbanFixture()

    expect(selectActiveBoardColumns(state)).toEqual(
      state.columnsByBoard[BOARD_MAIN_ID],
    )
    expect(selectActiveBoardTasks(state)).toEqual(
      state.tasksByBoard[BOARD_MAIN_ID],
    )
  })

  it('returns_a_compound_active_board_state', () => {
    const state = createKanbanFixture()

    expect(selectActiveBoardState(state)).toEqual({
      board: state.boards[0],
      columns: state.columnsByBoard[BOARD_MAIN_ID],
      tasks: state.tasksByBoard[BOARD_MAIN_ID],
    })
  })
})
