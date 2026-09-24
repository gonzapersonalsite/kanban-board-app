import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BoardDndContext } from '@/features/drag-and-drop/ui/BoardDndContext'
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/react'
import {
  BOARD_MAIN_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
} from '@/test/fixtures/kanbanFixtures'
import {
  createCanceledTaskDragEndEvent,
  createCompletedTaskDragEndEvent,
  dragFixtures,
} from '@/test/helpers/dndEventFactory'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'
import { useKanbanStore } from '@/shared/api'

const dragHandlers = vi.hoisted(() => ({
  onDragStart: undefined as (() => void) | undefined,
  onDragOver: undefined as ((event: DragOverEvent) => void) | undefined,
  onDragEnd: undefined as ((event: DragEndEvent) => void) | undefined,
}))

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({
    children,
    onDragStart,
    onDragOver,
    onDragEnd,
  }: {
    children: React.ReactNode
    onDragStart?: () => void
    onDragOver?: (event: DragOverEvent) => void
    onDragEnd?: (event: DragEndEvent) => void
  }) => {
    dragHandlers.onDragStart = onDragStart
    dragHandlers.onDragOver = onDragOver
    dragHandlers.onDragEnd = onDragEnd
    return <div data-testid="drag-provider">{children}</div>
  },
  DragOverlay: ({ children }: { children: (source: null) => React.ReactNode }) => (
    <div data-testid="drag-overlay">{typeof children === 'function' ? null : children}</div>
  ),
  PointerSensor: 'PointerSensor',
  KeyboardSensor: 'KeyboardSensor',
}))

describe('BoardDndContext', () => {
  setupKanbanStore()

  beforeEach(() => {
    dragHandlers.onDragStart = undefined
    dragHandlers.onDragOver = undefined
    dragHandlers.onDragEnd = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates_store_tasks_during_drag_over', () => {
    render(
      <BoardDndContext>
        <div>board</div>
      </BoardDndContext>,
    )

    dragHandlers.onDragStart?.()
    dragHandlers.onDragOver?.(dragFixtures.moveAlphaToProgress())

    expect(
      useKanbanStore.getState().tasksByBoard[BOARD_MAIN_ID][COLUMN_TODO_ID].map((task) => task.id),
    ).toEqual([TASK_BETA_ID])
    expect(
      useKanbanStore
        .getState()
        .tasksByBoard[BOARD_MAIN_ID][COLUMN_PROGRESS_ID]
        .map((task) => task.id),
    ).toContain(TASK_ALPHA_ID)
  })

  it('restores_previous_tasks_when_drag_is_canceled', () => {
    render(
      <BoardDndContext>
        <div>board</div>
      </BoardDndContext>,
    )

    const before = structuredClone(useKanbanStore.getState().tasksByBoard[BOARD_MAIN_ID])

    dragHandlers.onDragStart?.()
    dragHandlers.onDragOver?.(dragFixtures.moveAlphaToProgress())
    dragHandlers.onDragEnd?.({
      operation: { source: { type: 'task' }, canceled: true },
    } as unknown as DragEndEvent)

    expect(useKanbanStore.getState().tasksByBoard[BOARD_MAIN_ID]).toEqual(before)
  })

  it('leaves_the_store_and_storage_untouched_when_a_task_is_over_itself', () => {
    render(
      <BoardDndContext>
        <div>board</div>
      </BoardDndContext>,
    )
    const before = useKanbanStore.getState().tasksByBoard
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    dragHandlers.onDragStart?.()
    dragHandlers.onDragOver?.(dragFixtures.alphaOverItself())
    dragHandlers.onDragEnd?.(createCompletedTaskDragEndEvent())

    expect(useKanbanStore.getState().tasksByBoard).toBe(before)
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('leaves_the_store_and_storage_untouched_when_a_column_is_over_itself', () => {
    render(
      <BoardDndContext>
        <div>board</div>
      </BoardDndContext>,
    )
    const before = useKanbanStore.getState().columnsByBoard
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    dragHandlers.onDragStart?.()
    dragHandlers.onDragOver?.(dragFixtures.todoColumnOverItself())

    expect(useKanbanStore.getState().columnsByBoard).toBe(before)
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('does_not_write_when_a_drag_is_canceled_without_moving', () => {
    render(
      <BoardDndContext>
        <div>board</div>
      </BoardDndContext>,
    )
    const before = useKanbanStore.getState().tasksByBoard
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    dragHandlers.onDragStart?.()
    dragHandlers.onDragEnd?.(createCanceledTaskDragEndEvent())

    expect(useKanbanStore.getState().tasksByBoard).toBe(before)
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('renders_children_inside_drag_provider', () => {
    render(
      <BoardDndContext>
        <span>kanban-content</span>
      </BoardDndContext>,
    )

    expect(screen.getByTestId('drag-provider')).toBeInTheDocument()
    expect(screen.getByText('kanban-content')).toBeInTheDocument()
  })
})
