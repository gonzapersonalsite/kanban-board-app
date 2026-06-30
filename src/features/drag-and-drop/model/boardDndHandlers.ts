import { move } from '@dnd-kit/helpers'
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/react'
import type { ColumnId, Task } from '@/shared/api'

export type TasksByColumn = Record<ColumnId, Task[]>

export function cloneTasksSnapshot(tasks: TasksByColumn): TasksByColumn {
  return structuredClone(tasks)
}

export function shouldApplyTaskDragOver(
  source: { type?: string | number | symbol } | null | undefined,
): boolean {
  return source?.type === 'task'
}

export function applyTaskDragOver(
  tasks: TasksByColumn,
  event: DragOverEvent,
): TasksByColumn {
  return move(tasks, event) as TasksByColumn
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
