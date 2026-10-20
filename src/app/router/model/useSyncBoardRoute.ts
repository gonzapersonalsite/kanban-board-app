import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useKanbanStore } from '@/shared/api'
import { DEFAULT_LOCALE, extractPathLocale, resolveSupportedLocale } from '@/shared/i18n'
import { buildBoardPath, resolveRouteBoardId, type BoardViewRoute } from '@/entities/board'

export function useSyncBoardRoute(view: BoardViewRoute): boolean {
  const navigate = useNavigate()
  const location = useLocation()
  const { boardId } = useParams()
  const boards = useKanbanStore((state) => state.boards)
  const activeBoardId = useKanbanStore((state) => state.activeBoardId)
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard)

  const resolvedBoardId = resolveRouteBoardId(boards, activeBoardId, boardId)
  const isReady = !!resolvedBoardId && boardId === resolvedBoardId

  useEffect(() => {
    if (!resolvedBoardId) {
      return
    }

    if (boardId !== resolvedBoardId) {
      const queryLocale = resolveSupportedLocale(new URLSearchParams(location.search).get('lang'))
      const targetLocale = queryLocale ?? extractPathLocale(location.pathname) ?? DEFAULT_LOCALE
      navigate(buildBoardPath(view, resolvedBoardId, targetLocale), { replace: true })
      return
    }

    if (activeBoardId !== resolvedBoardId) {
      setActiveBoard(resolvedBoardId)
    }
  }, [activeBoardId, boardId, location.pathname, location.search, navigate, resolvedBoardId, setActiveBoard, view])

  return isReady
}
