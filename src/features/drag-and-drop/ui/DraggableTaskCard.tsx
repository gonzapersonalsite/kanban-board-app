import { useSortable } from '@dnd-kit/react/sortable'
import type { ColumnId, Task } from '@/shared/api'
import { TaskCard } from '@/entities/task'
import styles from './DraggableTaskCard.module.css'

interface DraggableTaskCardProps {
  task: Task
  columnId: ColumnId
  index: number
  onEdit: () => void
  onDelete: () => void
  accentColor?: string
}

export function DraggableTaskCard({
  task,
  columnId,
  index,
  onEdit,
  onDelete,
  accentColor,
}: DraggableTaskCardProps) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    type: 'task',
    accept: ['task'],
    group: columnId,
    data: { columnId },
  })

  return (
    <div ref={ref} className={styles.wrapper}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        accentColor={accentColor}
      />
    </div>
  )
}
