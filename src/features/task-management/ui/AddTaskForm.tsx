import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useKanbanStore } from '@/shared/api'
import type { ColumnId } from '@/shared/api'
import { Button, Input } from '@/shared/ui'
import styles from './AddTaskForm.module.css'

interface AddTaskFormProps {
  columnId: ColumnId
}

export function AddTaskForm({ columnId }: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const addTask = useKanbanStore((state) => state.addTask)

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(columnId, trimmed)
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
        placeholder="New task title..."
        aria-label="Task title"
        className={styles.input}
      />
      <Button onClick={handleSubmit} size="sm" variant="ghost">
        <Plus size={15} />
        Add Card
      </Button>
    </div>
  )
}
