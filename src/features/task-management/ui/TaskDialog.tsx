import { useState, type FormEvent } from 'react'
import { Dialog, Input, Textarea, Button } from '@/shared/ui'
import styles from './TaskDialog.module.css'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  onSave: (title: string, description: string) => void
  initialTitle?: string
  initialDescription?: string
}

export function TaskDialog({
  open,
  onClose,
  onSave,
  initialTitle = '',
  initialDescription = '',
}: TaskDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onSave(trimmed, description.trim())
  }

  const handleClose = () => {
    setTitle(initialTitle)
    setDescription(initialDescription)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Edit Task">
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Title
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
          />
        </label>
        <label className={styles.label}>
          Description
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description (optional)"
            rows={4}
          />
        </label>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
