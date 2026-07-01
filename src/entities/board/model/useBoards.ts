import { useKanbanStore } from '@/shared/api'
import { selectActiveBoard } from './selectors'

export function useBoards() {
  const boards = useKanbanStore((state) => state.boards)
  const activeBoardId = useKanbanStore((state) => state.activeBoardId)
  const activeBoard = useKanbanStore(selectActiveBoard)
  const addBoard = useKanbanStore((state) => state.addBoard)
  const updateBoard = useKanbanStore((state) => state.updateBoard)
  const deleteBoard = useKanbanStore((state) => state.deleteBoard)
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard)

  return {
    boards,
    activeBoardId,
    activeBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    setActiveBoard,
  } as const
}
