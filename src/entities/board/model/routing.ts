import type { Board, BoardId } from '@/shared/api'

export type BoardViewRoute = 'board' | 'calendar'

export function buildBoardPath(view: BoardViewRoute, boardId: BoardId): string {
  return `/${view}/${boardId}`
}

export function resolveFallbackBoardId(
  boards: Board[],
  activeBoardId: BoardId | null,
): BoardId | null {
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
