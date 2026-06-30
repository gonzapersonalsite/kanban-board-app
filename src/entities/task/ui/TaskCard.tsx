import { Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { IconButton, Tooltip } from '@/shared/ui'
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
  const { t } = useTranslation()
  const classes = [styles.card, isDragging ? styles.dragging : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <div className={styles.actions}>
          <Tooltip text={t('task.edit', { title: task.title })}>
            <IconButton
              icon={<Pencil size={14} />}
              label={t('task.edit', { title: task.title })}
              onClick={onEdit}
            />
          </Tooltip>
          <Tooltip text={t('task.delete', { title: task.title })}>
            <IconButton
              icon={<Trash2 size={14} />}
              label={t('task.delete', { title: task.title })}
              variant="danger"
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </div>
  )
}
