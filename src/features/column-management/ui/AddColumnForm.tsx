import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button, Input } from '@/shared/ui'
import styles from './AddColumnForm.module.css'

export function AddColumnForm() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const addColumn = useKanbanStore((state) => state.addColumn)

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError(t('validation.title_required'))
      return
    }
    addColumn(trimmed)
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
        placeholder={t('column.title_placeholder')}
        aria-label={t('column.title_aria')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'add-column-error' : undefined}
        className={styles.input}
      />
      {error && (
        <p id="add-column-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button onClick={handleSubmit} size="sm">
        <Plus size={16} />
        {t('column.add')}
      </Button>
    </div>
  )
}
