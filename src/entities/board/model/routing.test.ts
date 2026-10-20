import { describe, expect, it } from 'vitest'
import { BOARD_MAIN_ID, createKanbanFixture } from '@/test/fixtures/kanbanFixtures'
import { buildBoardPath, resolveFallbackBoardId, resolveRouteBoardId } from './routing'

describe('board routing', () => {
  it('builds_root_spanish_paths_by_default_and_prefixed_paths_for_other_locales', () => {
    expect(buildBoardPath('board', BOARD_MAIN_ID)).toBe(`/board/${BOARD_MAIN_ID}`)
    expect(buildBoardPath('board', BOARD_MAIN_ID, 'es')).toBe(`/board/${BOARD_MAIN_ID}`)
    expect(buildBoardPath('board', BOARD_MAIN_ID, 'en')).toBe(`/en/board/${BOARD_MAIN_ID}`)
    expect(buildBoardPath('calendar', BOARD_MAIN_ID, 'de')).toBe(`/de/calendar/${BOARD_MAIN_ID}`)
  })

  it('resolves_fallback_and_route_board_ids_safely', () => {
    const state = createKanbanFixture()

    expect(resolveFallbackBoardId(state.boards, BOARD_MAIN_ID)).toBe(BOARD_MAIN_ID)
    expect(resolveFallbackBoardId(state.boards, 'missing')).toBe(BOARD_MAIN_ID)
    expect(resolveFallbackBoardId([], null)).toBeNull()
    expect(resolveRouteBoardId(state.boards, BOARD_MAIN_ID, BOARD_MAIN_ID)).toBe(BOARD_MAIN_ID)
    expect(resolveRouteBoardId(state.boards, BOARD_MAIN_ID, 'missing')).toBe(BOARD_MAIN_ID)
  })
})
