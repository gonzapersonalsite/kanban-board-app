import { useRef } from 'react'
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/react'
import type { Column } from '@/shared/api'
import { useKanbanStore } from '@/shared/api'
import {
  selectActiveBoard,
  selectActiveBoardColumns,
  selectActiveBoardState,
  selectActiveBoardTasks,
} from '@/entities/board'
import {
  applyColumnDragOver,
  applyTaskDragOver,
  resolveColumnsAfterDragEnd,
  resolveTasksAfterDragEnd,
  type TasksByColumn,
} from './boardDndHandlers'

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

export function useBoardDndLifecycle() {
  const previousTasksRef = useRef<TasksByColumn | null>(null)
  const previousColumnsRef = useRef<Column[] | null>(null)

  // Store actions and move() never mutate collections in place, so the references held at
  // drag start are an exact snapshot. Restoring them after a cancel that moved nothing is a
  // no-op, which keeps an untouched sample board unsaved.
  const handleDragStart = () => {
    const state = useKanbanStore.getState()

    previousTasksRef.current = selectActiveBoardTasks(state)
    previousColumnsRef.current = selectActiveBoardColumns(state)
  }

  // dnd-kit fires a dragover with the source over itself as soon as a drag starts; move()
  // then returns the same collection. Skipping setState in that case avoids a pointless
  // write and keeps the untouched sample board from being persisted by a mere pick-up.
  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation
    if (!source) return

    const state = useKanbanStore.getState()
    const { board, tasks, columns } = selectActiveBoardState(state)
    const boardId = board?.id ?? null
    if (!boardId) return

    if (source.type === 'task') {
      const currentTasks = ensureColumnTaskEntries(tasks, columns)
      const nextTasks = applyTaskDragOver(currentTasks, event)
      if (nextTasks === currentTasks) return

      useKanbanStore.setState({
        tasksByBoard: {
          ...state.tasksByBoard,
          [boardId]: nextTasks,
        },
      })
      return
    }

    if (source.type === 'column') {
      const nextColumns = applyColumnDragOver(columns, event)
      if (nextColumns === columns) return

      useKanbanStore.setState({
        columnsByBoard: {
          ...state.columnsByBoard,
          [boardId]: nextColumns,
        },
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

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } as const
}
