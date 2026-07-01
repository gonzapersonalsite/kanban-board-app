import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { IconButton, Tooltip } from '@/shared/ui'
import styles from './TaskCard.module.css'

function DueDateBadge({ dueDate }: { dueDate: string }) {
  const { t, locale } = useTranslation()

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const formatted = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dueDate + 'T00:00:00'))

  let className: string
  let label: string

  if (dueDate < today) {
    className = styles.overdue
    label = `${t('task.overdue')}: ${formatted}`
  } else if (dueDate === today) {
    className = styles.dueToday
    label = t('task.due_today')
  } else {
    className = styles.upcoming
    label = `${t('task.due')}: ${formatted}`
  }

  return <p className={`${styles.dueDate} ${className}`}>{label}</p>
}

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  isDragging?: boolean
  accentColor?: string
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
  accentColor,
}: TaskCardProps) {
  const { t } = useTranslation()
  const classes = [styles.card, isDragging ? styles.dragging : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={accentColor ? ({ '--card-accent': accentColor } as React.CSSProperties) : undefined}
    >
      <div className={styles.header}>
        <GripVertical className={styles.gripIcon} />
        <h3 className={styles.title}>{task.title}</h3>
        <div className={styles.actions}>
          <Tooltip text={t('task.edit', { title: task.title })}>
            <IconButton
              icon={<Pencil />}
              label={t('task.edit', { title: task.title })}
              onClick={onEdit}
            />
          </Tooltip>
          <Tooltip text={t('task.delete', { title: task.title })}>
            <IconButton
              icon={<Trash2 />}
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
      {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
    </div>
  )
}
