import type { DragOverEvent, DragEndEvent } from '@dnd-kit/react'
import type { ColumnId } from '@/shared/api'
import {
  COLUMN_DONE_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
  TASK_GAMMA_ID,
} from '@/test/fixtures/kanbanFixtures'

function createDragManager(pointerY = 200) {
  return {
    dragOperation: {
      status: { idle: false },
      position: { current: { x: 0, y: pointerY } },
      shape: { current: { center: { x: 0, y: pointerY } } },
    },
  }
}

interface TaskToTaskDragEventParams {
  taskId: string
  sourceColumnId: ColumnId
  targetColumnId: ColumnId
  sourceIndex: number
  targetIndex: number
  targetTaskId: string
}

function createTaskToTaskDragOverEvent({
  taskId,
  sourceColumnId,
  targetColumnId,
  sourceIndex,
  targetIndex,
  targetTaskId,
}: TaskToTaskDragEventParams): DragOverEvent {
  return {
    operation: {
      source: {
        id: taskId,
        type: 'task',
        index: targetIndex,
        initialIndex: sourceIndex,
        initialGroup: sourceColumnId,
        group: targetColumnId,
        manager: createDragManager(),
      },
      target: {
        id: targetTaskId,
        type: 'task',
        shape: { center: { x: 0, y: 100 } },
      },
      canceled: false,
      activatorEvent: null,
      position: { x: 0, y: 0 },
      transform: { x: 0, y: 0 },
      status: { idle: false, dragging: true, dropping: false },
    },
  } as unknown as DragOverEvent
}

interface TaskToColumnDragEventParams {
  taskId: string
  sourceColumnId: ColumnId
  targetColumnId: ColumnId
  sourceIndex: number
  targetIndex: number
}

function createTaskToColumnDragOverEvent({
  taskId,
  sourceColumnId,
  targetColumnId,
  sourceIndex,
  targetIndex,
}: TaskToColumnDragEventParams): DragOverEvent {
  return {
    operation: {
      source: {
        id: taskId,
        type: 'task',
        index: targetIndex,
        initialIndex: sourceIndex,
        initialGroup: sourceColumnId,
        group: targetColumnId,
        manager: createDragManager(),
      },
      target: {
        id: targetColumnId,
        type: 'column',
        shape: { center: { x: 0, y: 50 } },
      },
      canceled: false,
      activatorEvent: null,
      position: { x: 0, y: 0 },
      transform: { x: 0, y: 0 },
      status: { idle: false, dragging: true, dropping: false },
    },
  } as unknown as DragOverEvent
}

export function createCanceledTaskDragEndEvent(): DragEndEvent {
  return {
    operation: {
      source: { type: 'task', id: TASK_ALPHA_ID },
      target: null,
      canceled: true,
      activatorEvent: null,
      position: { x: 0, y: 0 },
      transform: { x: 0, y: 0 },
      status: { idle: false, dragging: false, dropping: true },
    },
    canceled: true,
    nativeEvent: undefined,
    suspend: () => ({ resume: () => {} }),
  } as unknown as DragEndEvent
}

export function createCompletedTaskDragEndEvent(): DragEndEvent {
  return {
    operation: {
      source: { type: 'task', id: TASK_ALPHA_ID },
      target: null,
      canceled: false,
      activatorEvent: null,
      position: { x: 0, y: 0 },
      transform: { x: 0, y: 0 },
      status: { idle: false, dragging: false, dropping: true },
    },
    canceled: false,
    nativeEvent: undefined,
    suspend: () => ({ resume: () => {} }),
  } as unknown as DragEndEvent
}

export const dragFixtures = {
  moveAlphaToProgress: () =>
    createTaskToTaskDragOverEvent({
      taskId: TASK_ALPHA_ID,
      sourceColumnId: COLUMN_TODO_ID,
      targetColumnId: COLUMN_PROGRESS_ID,
      sourceIndex: 0,
      targetIndex: 1,
      targetTaskId: TASK_GAMMA_ID,
    }),
  moveBetaWithinTodo: () =>
    createTaskToTaskDragOverEvent({
      taskId: TASK_BETA_ID,
      sourceColumnId: COLUMN_TODO_ID,
      targetColumnId: COLUMN_TODO_ID,
      sourceIndex: 1,
      targetIndex: 0,
      targetTaskId: TASK_ALPHA_ID,
    }),
  moveGammaToDone: () =>
    createTaskToColumnDragOverEvent({
      taskId: TASK_GAMMA_ID,
      sourceColumnId: COLUMN_PROGRESS_ID,
      targetColumnId: COLUMN_DONE_ID,
      sourceIndex: 0,
      targetIndex: 0,
    }),
}
