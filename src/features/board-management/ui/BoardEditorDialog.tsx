import { Button, Dialog, Input } from '@/shared/ui'
import styles from './BoardManagement.module.css'

interface BoardEditorDialogProps {
  open: boolean
  title: string
  closeLabel: string
  value: string
  placeholder: string
  error: string | null
  cancelLabel: string
  submitLabel: string
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function BoardEditorDialog({
  open,
  title,
  closeLabel,
  value,
  placeholder,
  error,
  cancelLabel,
  submitLabel,
  onChange,
  onClose,
  onSubmit,
}: BoardEditorDialogProps) {
  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} title={title} closeLabel={closeLabel}>
      <div className={styles.dialogBody}>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={title}
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
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </Dialog>
  )
}
