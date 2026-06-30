import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import { Button, Input } from '@/shared/ui'
import styles from './AddColumnForm.module.css'

export function AddColumnForm() {
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
        placeholder="New column title..."
        aria-label="Column title"
        className={styles.input}
      />
      <Button onClick={handleSubmit} size="sm">
        <Plus size={16} />
        Add Column
      </Button>
    </div>
  )
}
