import { useState, type FormEvent } from 'react'
import { useTranslation } from '@/shared/i18n'
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
  const { t } = useTranslation()
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
    <Dialog open={open} onClose={handleClose} title={t('task.edit_dialog_title')} closeLabel={t('dialog.close')}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t('task.title_label')}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('task.title_placeholder')}
            autoFocus
          />
        </label>
        <label className={styles.label}>
          {t('task.description_label')}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task.description_placeholder')}
            rows={4}
          />
        </label>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('task.cancel')}
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            {t('task.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
