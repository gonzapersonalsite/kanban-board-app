import { move } from '@dnd-kit/helpers'
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/react'
import type { Column, ColumnId, Task } from '@/shared/api'

export type TasksByColumn = Record<ColumnId, Task[]>

export function cloneTasksSnapshot(tasks: TasksByColumn): TasksByColumn {
  return structuredClone(tasks)
}

export function cloneColumnsSnapshot(columns: Column[]): Column[] {
  return [...columns]
}

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
