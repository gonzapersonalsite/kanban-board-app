import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button, Input } from '@/shared/ui'
import styles from './AddColumnForm.module.css'

export function AddColumnForm() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const addColumn = useKanbanStore((state) => state.addColumn)

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addColumn(trimmed)
    setTitle('')
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
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('column.title_placeholder')}
        aria-label={t('column.title_aria')}
        className={styles.input}
      />
      <Button onClick={handleSubmit} size="sm">
        <Plus size={16} />
        {t('column.add')}
      </Button>
    </div>
  )
}
