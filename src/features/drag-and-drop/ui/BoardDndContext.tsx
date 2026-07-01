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
import {
  selectActiveBoard,
  selectActiveBoardColumns,
  selectActiveBoardState,
  selectActiveBoardTasks,
} from '@/entities/board'
import { TaskCard } from '@/entities/task'
import {
  applyTaskDragOver,
  applyColumnDragOver,
  cloneTasksSnapshot,
  cloneColumnsSnapshot,
  resolveTasksAfterDragEnd,
  resolveColumnsAfterDragEnd,
  type TasksByColumn,
} from '../model/boardDndHandlers'
import type { Column } from '@/shared/api'
import styles from './BoardDndContext.module.css'

function ensureColumnTaskEntries(
  tasks: TasksByColumn,
  columns: Column[],
): TasksByColumn {
  const entries = { ...tasks }
  let missing = false

  for (const col of columns) {
    if (!(col.id in entries)) {
      entries[col.id] = []
      missing = true
    }
  }

  return missing ? entries : tasks
}

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
  const tasks = selectActiveBoardTasks(state)

  for (const columnTasks of Object.values(tasks)) {
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

function ColumnDragOverlayContent({
  source,
}: {
  source: DragOverEvent['operation']['source'] | null
}) {
  if (!source || source.type !== 'column') return null

  const columnId = String(source.id)
  const state = useKanbanStore.getState()
  const columns = selectActiveBoardColumns(state)
  const column = columns.find((c) => c.id === columnId)
  if (!column) return null

  return <div className={styles.overlayColumn}>{column.title}</div>
}

export function BoardDndContext({ children }: BoardDndContextProps) {
  const previousTasksRef = useRef<TasksByColumn | null>(null)
  const previousColumnsRef = useRef<Column[] | null>(null)

  const handleDragStart = () => {
    const state = useKanbanStore.getState()
    const tasks = selectActiveBoardTasks(state)
    const columns = selectActiveBoardColumns(state)

    previousTasksRef.current = cloneTasksSnapshot(tasks)
    previousColumnsRef.current = cloneColumnsSnapshot(columns)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation
    if (!source) return

    if (source.type === 'task') {
      useKanbanStore.setState((state) => {
        const { board, tasks, columns } = selectActiveBoardState(state)
        const boardId = board?.id ?? null
        if (!boardId) {
          return state
        }

        return {
          tasksByBoard: {
            ...state.tasksByBoard,
            [boardId]: applyTaskDragOver(
              ensureColumnTaskEntries(tasks, columns),
              event,
            ),
          },
        }
      })
    } else if (source.type === 'column') {
      useKanbanStore.setState((state) => {
        const board = selectActiveBoard(state)
        const boardId = board?.id ?? null
        if (!boardId) {
          return state
        }
        const columns = selectActiveBoardColumns(state)

        return {
          columnsByBoard: {
            ...state.columnsByBoard,
            [boardId]: applyColumnDragOver(columns, event),
          },
        }
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { source } = event.operation

    if (source?.type === 'task') {
      const state = useKanbanStore.getState()
      const board = selectActiveBoard(state)
      const boardId = board?.id ?? null
      const currentTasks = selectActiveBoardTasks(state)
      if (!boardId) {
        previousTasksRef.current = null
        previousColumnsRef.current = null
        return
      }

      const nextTasks = resolveTasksAfterDragEnd(
        previousTasksRef.current,
        event,
        currentTasks,
      )

      if (nextTasks !== currentTasks) {
        useKanbanStore.setState({
          tasksByBoard: {
            ...state.tasksByBoard,
            [boardId]: nextTasks,
          },
        })
      }
    } else if (source?.type === 'column') {
      const state = useKanbanStore.getState()
      const board = selectActiveBoard(state)
      const boardId = board?.id ?? null
      const currentColumns = selectActiveBoardColumns(state)
      if (!boardId) {
        previousTasksRef.current = null
        previousColumnsRef.current = null
        return
      }

      const nextColumns = resolveColumnsAfterDragEnd(
        previousColumnsRef.current,
        event,
        currentColumns,
      )

      if (nextColumns !== currentColumns) {
        useKanbanStore.setState({
          columnsByBoard: {
            ...state.columnsByBoard,
            [boardId]: nextColumns,
          },
        })
      }
    }

    previousTasksRef.current = null
    previousColumnsRef.current = null
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
        {(source) => (
          <>
            <TaskDragOverlayContent source={source} />
            <ColumnDragOverlayContent source={source} />
          </>
        )}
      </DragOverlay>
    </DragDropProvider>
  )
}
