import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Board } from '@/widgets/board/ui/Board'
import { COLUMN_DONE_ID, COLUMN_TODO_ID } from '@/test/fixtures/kanbanFixtures'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'
import { useKanbanStore } from '@/shared/api'

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DragOverlay: () => null,
  useDroppable: () => ({ ref: () => undefined, isDropTarget: false }),
  useDragOperation: () => ({ source: null }),
  PointerSensor: {
    configure: () => 'PointerSensor',
  },
  KeyboardSensor: 'KeyboardSensor',
}))

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: () => ({
    ref: () => undefined,
    isDragging: false,
    isDropTarget: false,
  }),
}))

describe('Board', () => {
  it('renders_seed_columns_and_tasks', () => {
    renderWithKanban(<Board />)

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()
  })

  it('shows_empty_state_only_for_columns_without_tasks', () => {
    renderWithKanban(<Board />)

    expect(screen.getAllByText('No tasks yet')).toHaveLength(1)
    expect((useKanbanStore.getState().tasks[COLUMN_TODO_ID] ?? []).length).toBeGreaterThan(0)
    expect(useKanbanStore.getState().tasks[COLUMN_DONE_ID] ?? []).toHaveLength(0)
  })
})
