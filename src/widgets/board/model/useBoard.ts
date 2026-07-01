import { useKanbanStore } from '@/shared/api'
import { selectActiveBoardColumns, selectActiveBoardTasks } from '@/entities/board'
import { useColumnActions } from '@/features/column-management'
import { useTaskDialog } from '@/features/task-management'
import type { ColumnId, Task } from '@/shared/api'

export function useBoard() {
  const columns = useKanbanStore(selectActiveBoardColumns)
  const tasks = useKanbanStore(selectActiveBoardTasks)
  const columnActions = useColumnActions()
  const taskDialog = useTaskDialog()

  const getColumnTasks = (columnId: ColumnId): Task[] => {
    return tasks[columnId] ?? []
  }

  const hasTasks = (columnId: ColumnId): boolean => {
    return getColumnTasks(columnId).length > 0
  }

  return {
    columns,
    tasks,
    getColumnTasks,
    hasTasks,
    canDeleteColumn: columnActions.canDeleteColumn,
    handleRename: columnActions.handleRename,
    handleDeleteColumn: columnActions.handleDelete,
    taskDialog,
  } as const
}
