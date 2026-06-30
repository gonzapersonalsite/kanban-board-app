import type { Column, ColumnId, Task } from '@/shared/api'

export const COLUMN_TODO_ID = 'col-todo' as ColumnId
export const COLUMN_PROGRESS_ID = 'col-progress' as ColumnId
export const COLUMN_DONE_ID = 'col-done' as ColumnId

export const TASK_ALPHA_ID = 'task-alpha'
export const TASK_BETA_ID = 'task-beta'
export const TASK_GAMMA_ID = 'task-gamma'

export const fixtureColumns: Column[] = [
  { id: COLUMN_TODO_ID, title: 'To Do' },
  { id: COLUMN_PROGRESS_ID, title: 'In Progress' },
  { id: COLUMN_DONE_ID, title: 'Done' },
]

export const fixtureTasks: Record<ColumnId, Task[]> = {
  [COLUMN_TODO_ID]: [
    { id: TASK_ALPHA_ID, title: 'Alpha', description: 'First task' },
    { id: TASK_BETA_ID, title: 'Beta', description: '' },
  ],
  [COLUMN_PROGRESS_ID]: [
    { id: TASK_GAMMA_ID, title: 'Gamma', description: 'In progress' },
  ],
  [COLUMN_DONE_ID]: [],
}

export function createKanbanFixture() {
  return {
    columns: structuredClone(fixtureColumns),
    tasks: structuredClone(fixtureTasks),
  }
}
