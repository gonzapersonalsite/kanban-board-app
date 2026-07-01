import { Pencil, Plus, Trash2 } from 'lucide-react'
import { BoardSelector } from '@/entities/board'
import { useTranslation } from '@/shared/i18n'
import { IconButton, Tooltip } from '@/shared/ui'
import { useBoardManagement } from '../model/useBoardManagement'
import { BoardDeleteDialog } from './BoardDeleteDialog'
import { BoardEditorDialog } from './BoardEditorDialog'

interface BoardManagementProps {
  onBoardChange?: (boardId: string) => void
  className?: string
}

export function BoardManagement({
  onBoardChange,
  className,
}: BoardManagementProps) {
  const { t } = useTranslation()
  const boardManagement = useBoardManagement(onBoardChange)

  return (
    <>
      <BoardSelector
        boards={boardManagement.boards}
        activeBoardId={boardManagement.activeBoardId}
        onBoardChange={boardManagement.handleBoardChange}
        className={className}
        actions={
          <>
            <Tooltip text={t('board.add')}>
              <IconButton
                icon={<Plus size={16} />}
                label={t('board.add')}
                onClick={boardManagement.openCreateDialog}
              />
            </Tooltip>
            <Tooltip text={t('board.rename')}>
              <IconButton
                icon={<Pencil size={16} />}
                label={t('board.rename')}
                onClick={boardManagement.openRenameDialog}
                disabled={!boardManagement.activeBoard}
              />
            </Tooltip>
            <Tooltip text={t('board.delete')}>
              <IconButton
                icon={<Trash2 size={16} />}
                label={t('board.delete')}
                variant="danger"
                onClick={boardManagement.openDeleteDialog}
                disabled={!boardManagement.canDeleteBoard}
              />
            </Tooltip>
          </>
        }
      />
      <BoardEditorDialog
        open={!!boardManagement.dialogMode}
        title={boardManagement.isRenameMode ? t('board.rename') : t('board.add')}
        closeLabel={t('dialog.close')}
        value={boardManagement.draftTitle}
        placeholder={t('board.title_placeholder')}
        error={boardManagement.error}
        cancelLabel={t('board.cancel_action')}
        submitLabel={
          boardManagement.isRenameMode
            ? t('board.save_action')
            : t('board.create_action')
        }
        onChange={boardManagement.handleTitleChange}
        onClose={boardManagement.closeEditorDialog}
        onSubmit={() =>
          boardManagement.handleSaveDialog(t('validation.title_required'))
        }
      />
      <BoardDeleteDialog
        open={boardManagement.isDeleteOpen && !!boardManagement.activeBoard}
        title={t('board.confirm_delete_title')}
        closeLabel={t('dialog.close')}
        message={t('board.confirm_delete_message')}
        boardTitle={boardManagement.activeBoardTitle}
        cancelLabel={t('board.cancel_action')}
        confirmLabel={t('board.confirm_delete_action')}
        onClose={boardManagement.closeDeleteDialog}
        onConfirm={boardManagement.handleDeleteBoard}
      />
    </>
  )
}
