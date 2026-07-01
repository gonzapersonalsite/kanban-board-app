import { useState, type FormEvent } from 'react'
import { useTranslation } from '@/shared/i18n'
import { Dialog, Input, Textarea, Button } from '@/shared/ui'
import styles from './TaskDialog.module.css'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  onSave: (title: string, description: string, dueDate: string) => void
  initialTitle?: string
  initialDescription?: string
  initialDueDate?: string
}

export function TaskDialog({
  open,
  onClose,
  onSave,
  initialTitle = '',
  initialDescription = '',
  initialDueDate = '',
}: TaskDialogProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [dueDate, setDueDate] = useState(initialDueDate)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onSave(trimmed, description.trim(), dueDate)
  }

  const handleClose = () => {
    setTitle(initialTitle)
    setDescription(initialDescription)
    setDueDate(initialDueDate)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title={t('task_dialog.title')} closeLabel={t('dialog.close')}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t('task_dialog.title_label')}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('task_dialog.title_placeholder')}
            autoFocus
          />
        </label>
        <label className={styles.label}>
          {t('task_dialog.description_label')}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task_dialog.description_placeholder')}
            rows={4}
          />
        </label>
        <label className={styles.label}>
          {t('task_dialog.due_date_label')}
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('task_dialog.cancel')}
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            {t('task_dialog.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
