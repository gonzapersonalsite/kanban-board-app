import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DraggableTaskCard } from './DraggableTaskCard'
import {
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  fixtureTasks,
} from '@/test/fixtures/kanbanFixtures'

const mockUseSortable = vi.hoisted(() =>
  vi.fn(() => ({
    ref: vi.fn(),
    isDragging: false,
  })),
)

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: mockUseSortable,
}))

describe('DraggableTaskCard', () => {
  const task = fixtureTasks[COLUMN_TODO_ID].find((t) => t.id === TASK_ALPHA_ID)!

  it('renders_task_card_with_task_data', () => {
    render(
      <DraggableTaskCard
        task={task}
        columnId={COLUMN_TODO_ID}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByText('First task')).toBeInTheDocument()
  })

  it('forwards_onEdit_and_onDelete_callbacks', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <DraggableTaskCard
        task={task}
        columnId={COLUMN_TODO_ID}
        index={0}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /edit task "alpha"/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /delete task "alpha"/i }),
    )

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('configures_useSortable_with_correct_params', () => {
    render(
      <DraggableTaskCard
        task={task}
        columnId={COLUMN_TODO_ID}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: TASK_ALPHA_ID,
      index: 0,
      type: 'task',
      accept: ['task'],
      group: COLUMN_TODO_ID,
      data: { columnId: COLUMN_TODO_ID },
    })
  })
})
