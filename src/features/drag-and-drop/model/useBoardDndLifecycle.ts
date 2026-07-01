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
  cloneColumnsSnapshot,
  cloneTasksSnapshot,
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
      return
    }

    if (source.type === 'column') {
      useKanbanStore.setState((state) => {
        const board = selectActiveBoard(state)
        const boardId = board?.id ?? null
        if (!boardId) {
          return state
        }

        return {
          columnsByBoard: {
            ...state.columnsByBoard,
            [boardId]: applyColumnDragOver(selectActiveBoardColumns(state), event),
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

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } as const
}
