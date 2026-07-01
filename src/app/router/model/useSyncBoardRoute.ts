import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useKanbanStore } from '@/shared/api'
import {
  buildBoardPath,
  resolveRouteBoardId,
  type BoardViewRoute,
} from '@/entities/board'

export function useSyncBoardRoute(view: BoardViewRoute): boolean {
  const navigate = useNavigate()
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
      navigate(buildBoardPath(view, resolvedBoardId), { replace: true })
      return
    }

    if (activeBoardId !== resolvedBoardId) {
      setActiveBoard(resolvedBoardId)
    }
  }, [activeBoardId, boardId, navigate, resolvedBoardId, setActiveBoard, view])

  return isReady
}
