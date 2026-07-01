import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import type { ColumnId } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button, Input } from '@/shared/ui'
import styles from './AddTaskForm.module.css'

interface AddTaskFormProps {
  columnId: ColumnId
}

export function AddTaskForm({ columnId }: AddTaskFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const addTask = useKanbanStore((state) => state.addTask)

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError(t('validation.title_required'))
      return
    }
    addTask(columnId, trimmed)
    setTitle('')
    setError(null)
  }

  const handleChange = (value: string) => {
    setTitle(value)
    if (error) setError(null)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className={styles.form}>
      <Input
        value={title}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('task.title_placeholder')}
        aria-label={t('task.title_aria')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'add-task-error' : undefined}
        className={styles.input}
      />
      {error && (
        <p id="add-task-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button onClick={handleSubmit} size="sm" variant="ghost">
        <Plus />
        {t('task.add')}
      </Button>
    </div>
  )
}
