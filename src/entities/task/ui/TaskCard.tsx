import { Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/shared/api'
import { IconButton } from '@/shared/ui'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  isDragging?: boolean
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
}: TaskCardProps) {
  const classes = [styles.card, isDragging ? styles.dragging : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <div className={styles.actions}>
          <IconButton
            icon={<Pencil size={14} />}
            label={`Edit task "${task.title}"`}
            onClick={onEdit}
          />
          <IconButton
            icon={<Trash2 size={14} />}
            label={`Delete task "${task.title}"`}
            variant="danger"
            onClick={onDelete}
          />
        </div>
      </div>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </div>
  )
}
