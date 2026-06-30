import { type ReactNode, useRef } from 'react'
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/react'
import { useKanbanStore } from '@/shared/api'
import { TaskCard } from '@/entities/task'
import {
  applyTaskDragOver,
  cloneTasksSnapshot,
  resolveTasksAfterDragEnd,
  type TasksByColumn,
} from '../model/boardDndHandlers'
import styles from './BoardDndContext.module.css'

interface BoardDndContextProps {
  children: ReactNode
}

function TaskDragOverlayContent({
  source,
}: {
  source: DragOverEvent['operation']['source'] | null
}) {
  if (!source || source.type !== 'task') return null

  const taskId = String(source.id)
  const state = useKanbanStore.getState()

  for (const columnTasks of Object.values(state.tasks)) {
    const task = columnTasks.find((item) => item.id === taskId)
    if (task) {
      return (
        <div className={styles.overlayCard}>
          <TaskCard
            task={task}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        </div>
      )
    }
  }

  return null
}

export function BoardDndContext({ children }: BoardDndContextProps) {
  const previousTasksRef = useRef<TasksByColumn | null>(null)

  const handleDragStart = () => {
    previousTasksRef.current = cloneTasksSnapshot(
      useKanbanStore.getState().tasks,
    )
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation
    if (!source || source.type !== 'task') return

    useKanbanStore.setState((state) => ({
      tasks: applyTaskDragOver(state.tasks, event),
    }))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const currentTasks = useKanbanStore.getState().tasks
    const nextTasks = resolveTasksAfterDragEnd(
      previousTasksRef.current,
      event,
      currentTasks,
    )

    if (nextTasks !== currentTasks) {
      useKanbanStore.setState({ tasks: nextTasks })
    }

    previousTasksRef.current = null
  }

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={[PointerSensor, KeyboardSensor]}
    >
      {children}
      <DragOverlay className={styles.overlay}>
        {(source) => <TaskDragOverlayContent source={source} />}
      </DragOverlay>
    </DragDropProvider>
  )
}
