import { useKanbanStore } from '@/shared/api'
import type { ColumnId } from '@/shared/api'

export function useColumnActions() {
  const tasks = useKanbanStore((state) => state.tasks)
  const updateColumn = useKanbanStore((state) => state.updateColumn)
  const deleteColumn = useKanbanStore((state) => state.deleteColumn)

  const canDeleteColumn = (id: ColumnId): boolean => {
    const columnTasks = tasks[id]
    return !columnTasks || columnTasks.length === 0
  }

  const handleRename = (id: ColumnId, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    updateColumn(id, trimmed)
  }

  const handleDelete = (id: ColumnId) => {
    deleteColumn(id)
  }

  return { canDeleteColumn, handleRename, handleDelete } as const
}
