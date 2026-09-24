import { move } from '@dnd-kit/helpers'
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/react'
import type { Column, ColumnId, Task } from '@/shared/api'

export type TasksByColumn = Record<ColumnId, Task[]>

// Both appliers return the very same collection when the drag moves nothing (move() from
// @dnd-kit/helpers does so); useBoardDndLifecycle relies on that to skip store writes.
export function applyTaskDragOver(
  tasks: TasksByColumn,
  event: DragOverEvent,
): TasksByColumn {
  return move(tasks, event) as TasksByColumn
}

export function applyColumnDragOver(
  columns: Column[],
  event: DragOverEvent,
): Column[] {
  return move(columns, event) as Column[]
}

export function resolveTasksAfterDragEnd(
  previousSnapshot: TasksByColumn | null,
  event: DragEndEvent,
  currentTasks: TasksByColumn,
): TasksByColumn {
  const { source, canceled } = event.operation

  if (canceled && source?.type === 'task' && previousSnapshot) {
    return previousSnapshot
  }

  return currentTasks
}

export function resolveColumnsAfterDragEnd(
  previousSnapshot: Column[] | null,
  event: DragEndEvent,
  currentColumns: Column[],
): Column[] {
  const { source, canceled } = event.operation

  if (canceled && source?.type === 'column' && previousSnapshot) {
    return previousSnapshot
  }

  return currentColumns
}
