import type { DragOverEvent } from '@dnd-kit/react'
import { useKanbanStore } from '@/shared/api'
import { selectActiveBoardTasks } from '@/entities/board'
import { TaskCard } from '@/entities/task'
import styles from './BoardDndContext.module.css'

interface TaskDragOverlayContentProps {
  source: DragOverEvent['operation']['source'] | null
}

export function TaskDragOverlayContent({
  source,
}: TaskDragOverlayContentProps) {
  if (!source || source.type !== 'task') return null

  const taskId = String(source.id)
  const state = useKanbanStore.getState()
  const tasks = selectActiveBoardTasks(state)

  for (const columnTasks of Object.values(tasks)) {
    const task = columnTasks.find((item) => item.id === taskId)
    if (task) {
      return (
        <div className={styles.overlayCard}>
          <TaskCard task={task} onEdit={() => {}} onDelete={() => {}} isDragging />
        </div>
      )
    }
  }

  return null
}
