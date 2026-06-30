import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SortableColumn } from './SortableColumn'
import { COLUMN_TODO_ID, TASK_ALPHA_ID } from '@/test/fixtures/kanbanFixtures'

const mockUseSortable = vi.hoisted(() =>
  vi.fn(() => ({
    ref: vi.fn(),
    isDragging: false,
  })),
)

const mockUseDragOperation = vi.hoisted(() =>
  vi.fn(() => ({
    source: null,
    target: null,
  })),
)

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: mockUseSortable,
}))

vi.mock('@dnd-kit/react', () => ({
  useDragOperation: mockUseDragOperation,
}))

describe('SortableColumn', () => {
  beforeEach(() => {
    mockUseSortable.mockReturnValue({ ref: vi.fn(), isDragging: false })
    mockUseDragOperation.mockReturnValue({ source: null, target: null })
  })

  it('renders_children', () => {
    render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={0}>
        <div>child-content</div>
      </SortableColumn>,
    )

    expect(screen.getByText('child-content')).toBeInTheDocument()
  })

  it('applies_highlighted_class_when_task_is_dragged_over', () => {
    mockUseDragOperation.mockReturnValue({
      source: { type: 'task', id: TASK_ALPHA_ID },
      target: { id: COLUMN_TODO_ID, data: { columnId: COLUMN_TODO_ID } },
    })

    const { container } = render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={0}>
        <div>content</div>
      </SortableColumn>,
    )

    expect(container.firstChild).toHaveClass('highlighted')
  })

  it('does_not_highlight_when_column_itself_is_dragging', () => {
    mockUseSortable.mockReturnValue({ ref: vi.fn(), isDragging: true })
    mockUseDragOperation.mockReturnValue({
      source: { type: 'task', id: TASK_ALPHA_ID },
      target: { id: COLUMN_TODO_ID, data: { columnId: COLUMN_TODO_ID } },
    })

    const { container } = render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={0}>
        <div>content</div>
      </SortableColumn>,
    )

    expect(container.firstChild).not.toHaveClass('highlighted')
  })

  it('does_not_highlight_when_dragging_a_column_type', () => {
    mockUseDragOperation.mockReturnValue({
      source: { type: 'column' },
      target: { id: COLUMN_TODO_ID },
    })

    const { container } = render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={0}>
        <div>content</div>
      </SortableColumn>,
    )

    expect(container.firstChild).not.toHaveClass('highlighted')
  })

  it('applies_dragging_class_when_column_is_dragging', () => {
    mockUseSortable.mockReturnValue({ ref: vi.fn(), isDragging: true })

    const { container } = render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={0}>
        <div>content</div>
      </SortableColumn>,
    )

    expect(container.firstChild).toHaveClass('dragging')
  })

  it('configures_useSortable_with_correct_params', () => {
    render(
      <SortableColumn columnId={COLUMN_TODO_ID} index={1}>
        <div>content</div>
      </SortableColumn>,
    )

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: COLUMN_TODO_ID,
      index: 1,
      type: 'column',
      accept: ['task', 'column'],
      group: 'board',
      data: { columnId: COLUMN_TODO_ID },
    })
  })
})
