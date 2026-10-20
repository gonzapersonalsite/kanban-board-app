import type { Board, BoardId } from '@/shared/api'
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/shared/i18n'

export type BoardViewRoute = 'board' | 'calendar'

export function buildBoardPath(view: BoardViewRoute, boardId: BoardId, locale: Locale = DEFAULT_LOCALE): string {
  return localizePath(`/${view}/${boardId}`, locale)
}

export function resolveFallbackBoardId(boards: Board[], activeBoardId: BoardId | null): BoardId | null {
  if (activeBoardId && boards.some((board) => board.id === activeBoardId)) {
    return activeBoardId
  }

  return boards[0]?.id ?? null
}

export function resolveRouteBoardId(
  boards: Board[],
  activeBoardId: BoardId | null,
  routeBoardId?: string,
): BoardId | null {
  if (routeBoardId && boards.some((board) => board.id === routeBoardId)) {
    return routeBoardId
  }

  return resolveFallbackBoardId(boards, activeBoardId)
}
