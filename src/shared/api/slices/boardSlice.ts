import type { StateCreator } from 'zustand'
import type { BoardSlice, BoardId, KanbanState } from './types'
import { createBoardData } from './helpers'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'

export function createBoardSlice(
  initialState: Pick<KanbanState, 'boards' | 'activeBoardId'>,
): StateCreator<KanbanState, [], [], BoardSlice> {
  return (set) => ({
    boards: initialState.boards,
    activeBoardId: initialState.activeBoardId,

    addBoard: (title) =>
      set((state) => {
        const { board, columns, tasks } = createBoardData(title)

        return {
          boards: [...state.boards, board],
          activeBoardId: board.id,
          columnsByBoard: {
            ...state.columnsByBoard,
            [board.id]: columns,
          },
          tasksByBoard: {
            ...state.tasksByBoard,
            [board.id]: tasks,
          },
        }
      }),

    updateBoard: (id, title) => {
      const trimmed = title.trim()

      if (!trimmed) {
        const t = useI18nStore.getState().t
        useToastStore.getState().addNotification('error', t('validation.title_required'))
        return
      }

      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === id ? { ...board, title: trimmed } : board,
        ),
      }))
    },

    deleteBoard: (id) =>
      set((state) => {
        if (state.boards.length <= 1) {
          return state
        }

        const boardExists = state.boards.some((board) => board.id === id)
        if (!boardExists) {
          return state
        }

        const remainingBoards = state.boards.filter((board) => board.id !== id)
        const nextColumnsByBoard = { ...state.columnsByBoard }
        const nextTasksByBoard = { ...state.tasksByBoard }

        delete nextColumnsByBoard[id]
        delete nextTasksByBoard[id]

        const nextActiveBoardId = resolveNextActiveBoardId(
          remainingBoards.map((board) => board.id),
          state.activeBoardId,
          id,
        )

        return {
          boards: remainingBoards,
          activeBoardId: nextActiveBoardId,
          columnsByBoard: nextColumnsByBoard,
          tasksByBoard: nextTasksByBoard,
        }
      }),

    setActiveBoard: (id) =>
      set((state) => {
        if (!state.boards.some((board) => board.id === id)) {
          return state
        }

        return {
          activeBoardId: id,
        }
      }),
  })
}

function resolveNextActiveBoardId(
  boardIds: BoardId[],
  activeBoardId: BoardId | null,
  deletedBoardId: BoardId,
): BoardId | null {
  if (activeBoardId && activeBoardId !== deletedBoardId) {
    return activeBoardId
  }

  return boardIds[0] ?? null
}
