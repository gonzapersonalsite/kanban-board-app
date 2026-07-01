import { Button, Dialog } from '@/shared/ui'
import styles from './BoardManagement.module.css'

interface BoardDeleteDialogProps {
  open: boolean
  title: string
  closeLabel: string
  message: string
  boardTitle: string
  cancelLabel: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => void
}

export function BoardDeleteDialog({
  open,
  title,
  closeLabel,
  message,
  boardTitle,
  cancelLabel,
  confirmLabel,
  onClose,
  onConfirm,
}: BoardDeleteDialogProps) {
  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} title={title} closeLabel={closeLabel}>
      <div className={styles.dialogBody}>
        <p className={styles.message}>{message}</p>
        <p className={styles.message}>{boardTitle}</p>
        <div className={styles.dialogActions}>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
