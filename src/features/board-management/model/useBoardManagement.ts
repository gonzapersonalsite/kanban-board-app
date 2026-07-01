import { useMemo, useState } from 'react'
import { useKanbanStore } from '@/shared/api'
import { useBoards } from '@/entities/board'

type DialogMode = 'create' | 'rename' | null

export function useBoardManagement(onBoardChange?: (boardId: string) => void) {
  const { boards, activeBoardId, activeBoard, addBoard, updateBoard, deleteBoard, setActiveBoard } =
    useBoards()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const canDeleteBoard = boards.length > 1 && !!activeBoard
  const isRenameMode = dialogMode === 'rename'
  const activeBoardTitle = useMemo(() => activeBoard?.title ?? '', [activeBoard])

  const closeEditorDialog = () => {
    setDialogMode(null)
    setDraftTitle('')
    setError(null)
  }

  const openCreateDialog = () => {
    setDraftTitle('')
    setError(null)
    setDialogMode('create')
  }

  const openRenameDialog = () => {
    if (!activeBoard) return

    setDraftTitle(activeBoard.title)
    setError(null)
    setDialogMode('rename')
  }

  const handleBoardChange = (boardId: string) => {
    setActiveBoard(boardId)
    onBoardChange?.(boardId)
  }

  const handleTitleChange = (value: string) => {
    setDraftTitle(value)
    if (error) {
      setError(null)
    }
  }

  const handleSaveDialog = (titleRequiredMessage: string) => {
    const trimmed = draftTitle.trim()

    if (!trimmed) {
      setError(titleRequiredMessage)
      return false
    }

    if (dialogMode === 'create') {
      addBoard(trimmed)
      const nextBoardId = useKanbanStore.getState().activeBoardId
      if (nextBoardId) {
        onBoardChange?.(nextBoardId)
      }
      closeEditorDialog()
      return true
    }

    if (dialogMode === 'rename' && activeBoard) {
      updateBoard(activeBoard.id, trimmed)
      closeEditorDialog()
      return true
    }

    return false
  }

  const handleDeleteBoard = () => {
    if (!activeBoard || !canDeleteBoard) return

    deleteBoard(activeBoard.id)
    const nextBoardId = useKanbanStore.getState().activeBoardId
    if (nextBoardId) {
      onBoardChange?.(nextBoardId)
    }
    setIsDeleteOpen(false)
  }

  return {
    boards,
    activeBoardId,
    activeBoard,
    activeBoardTitle,
    canDeleteBoard,
    dialogMode,
    isRenameMode,
    draftTitle,
    error,
    isDeleteOpen,
    closeEditorDialog,
    openCreateDialog,
    openRenameDialog,
    handleBoardChange,
    handleTitleChange,
    handleSaveDialog,
    handleDeleteBoard,
    openDeleteDialog: () => setIsDeleteOpen(true),
    closeDeleteDialog: () => setIsDeleteOpen(false),
  } as const
}
