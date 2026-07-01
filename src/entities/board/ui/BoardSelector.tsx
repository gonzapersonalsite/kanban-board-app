import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button, Dialog, IconButton, Input, Tooltip } from '@/shared/ui'
import { useBoards } from '../model/useBoards'
import styles from './BoardSelector.module.css'

type DialogMode = 'create' | 'rename' | null

interface BoardSelectorProps {
  onBoardChange?: (boardId: string) => void
  className?: string
}

export function BoardSelector({ onBoardChange, className }: BoardSelectorProps) {
  const { t } = useTranslation()
  const {
    boards,
    activeBoardId,
    activeBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    setActiveBoard,
  } = useBoards()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isRenameMode = dialogMode === 'rename'
  const dialogTitle = isRenameMode ? t('board.rename') : t('board.add')
  const canDeleteBoard = boards.length > 1 && !!activeBoard

  const activeBoardTitle = useMemo(
    () => activeBoard?.title ?? t('board.default_title'),
    [activeBoard, t],
  )

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

  const handleSaveDialog = () => {
    const trimmed = draftTitle.trim()

    if (!trimmed) {
      setError(t('validation.title_required'))
      return
    }

    if (dialogMode === 'create') {
      addBoard(trimmed)
      const nextBoardId = useKanbanStore.getState().activeBoardId
      if (nextBoardId) {
        onBoardChange?.(nextBoardId)
      }
      closeEditorDialog()
      return
    }

    if (dialogMode === 'rename' && activeBoard) {
      updateBoard(activeBoard.id, trimmed)
      closeEditorDialog()
    }
  }

  const handleTitleChange = (value: string) => {
    setDraftTitle(value)
    if (error) {
      setError(null)
    }
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

  return (
    <>
      <div className={[styles.selector, className].filter(Boolean).join(' ')}>
        <label className={styles.label} htmlFor="board-selector">
          {t('board.switch_board')}
        </label>
        <select
          id="board-selector"
          className={styles.select}
          aria-label={t('board.switch_board')}
          value={activeBoardId ?? ''}
          onChange={(event) => {
            setActiveBoard(event.target.value)
            onBoardChange?.(event.target.value)
          }}
        >
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.title}
            </option>
          ))}
        </select>
        <div className={styles.actions}>
          <Tooltip text={t('board.add')}>
            <IconButton
              icon={<Plus size={16} />}
              label={t('board.add')}
              onClick={openCreateDialog}
            />
          </Tooltip>
          <Tooltip text={t('board.rename')}>
            <IconButton
              icon={<Pencil size={16} />}
              label={t('board.rename')}
              onClick={openRenameDialog}
              disabled={!activeBoard}
            />
          </Tooltip>
          <Tooltip text={t('board.delete')}>
            <IconButton
              icon={<Trash2 size={16} />}
              label={t('board.delete')}
              variant="danger"
              onClick={() => setIsDeleteOpen(true)}
              disabled={!canDeleteBoard}
            />
          </Tooltip>
        </div>
      </div>

      {dialogMode && (
        <Dialog
          open={true}
          onClose={closeEditorDialog}
          title={dialogTitle}
          closeLabel={t('dialog.close')}
        >
          <div className={styles.dialogBody}>
            <Input
              value={draftTitle}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder={t('board.title_placeholder')}
              aria-label={dialogTitle}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'board-dialog-error' : undefined}
              autoFocus
            />
            {error && (
              <p id="board-dialog-error" className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.dialogActions}>
              <Button variant="ghost" onClick={closeEditorDialog}>
                {t('board.cancel_action')}
              </Button>
              <Button onClick={handleSaveDialog}>
                {dialogMode === 'create'
                  ? t('board.create_action')
                  : t('board.save_action')}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {isDeleteOpen && activeBoard && (
        <Dialog
          open={true}
          onClose={() => setIsDeleteOpen(false)}
          title={t('board.confirm_delete_title')}
          closeLabel={t('dialog.close')}
        >
          <div className={styles.dialogBody}>
            <p className={styles.message}>
              {t('board.confirm_delete_message')}
            </p>
            <p className={styles.message}>{activeBoardTitle}</p>
            <div className={styles.dialogActions}>
              <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                {t('board.cancel_action')}
              </Button>
              <Button variant="danger" onClick={handleDeleteBoard}>
                {t('board.confirm_delete_action')}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
