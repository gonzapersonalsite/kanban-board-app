export type ColumnId = string
export type TaskId = string

export interface Column {
  id: ColumnId
  title: string
}

export interface Task {
  id: TaskId
  title: string
  description: string
  dueDate?: string
}

export interface ColumnSlice {
  columns: Column[]
  addColumn: (title: string) => void
  updateColumn: (id: ColumnId, title: string) => void
  deleteColumn: (id: ColumnId) => void
}

export interface TaskSlice {
  tasks: Record<ColumnId, Task[]>
  addTask: (columnId: ColumnId, title: string, description?: string, dueDate?: string) => void
  updateTask: (
    columnId: ColumnId,
    taskId: TaskId,
    data: Partial<Task>,
  ) => void
  deleteTask: (columnId: ColumnId, taskId: TaskId) => void
  reorderTask: (
    columnId: ColumnId,
    fromIndex: number,
    toIndex: number,
  ) => void
}

export interface BoardSlice {
  reorderColumns: (fromIndex: number, toIndex: number) => void
  moveTask: (
    sourceColId: ColumnId,
    destColId: ColumnId,
    taskId: TaskId,
    newIndex: number,
  ) => void
}

export type KanbanState = ColumnSlice & TaskSlice & BoardSlice
