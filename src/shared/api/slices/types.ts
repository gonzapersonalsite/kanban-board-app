export type BoardId = string
export type ColumnId = string
export type TaskId = string

export interface Board {
  id: BoardId
  title: string
}

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

export type TasksByColumn = Record<ColumnId, Task[]>
export type ColumnsByBoard = Record<BoardId, Column[]>
export type TasksByBoard = Record<BoardId, TasksByColumn>

export interface BoardSlice {
  boards: Board[]
  activeBoardId: BoardId | null
  addBoard: (title?: string) => void
  updateBoard: (id: BoardId, title: string) => void
  deleteBoard: (id: BoardId) => void
  setActiveBoard: (id: BoardId) => void
}

export interface ColumnSlice {
  columnsByBoard: ColumnsByBoard
  addColumn: (title: string) => void
  updateColumn: (id: ColumnId, title: string) => void
  deleteColumn: (id: ColumnId) => void
}

export interface TaskSlice {
  tasksByBoard: TasksByBoard
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

export interface DndSlice {
  reorderColumns: (fromIndex: number, toIndex: number) => void
  moveTask: (
    sourceColId: ColumnId,
    destColId: ColumnId,
    taskId: TaskId,
    newIndex: number,
  ) => void
}

export type KanbanState = BoardSlice & ColumnSlice & TaskSlice & DndSlice

export type PortableKanbanState = Pick<
  KanbanState,
  'boards' | 'activeBoardId' | 'columnsByBoard' | 'tasksByBoard'
>
