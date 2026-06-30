import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { COLUMN_TODO_ID, TASK_ALPHA_ID, fixtureTasks } from '@/test/fixtures/kanbanFixtures'

describe('TaskCard', () => {
  const task = fixtureTasks[COLUMN_TODO_ID].find((item) => item.id === TASK_ALPHA_ID)!

  it('renders_task_title_and_description', () => {
    render(
      <TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByText('First task')).toBeInTheDocument()
  })

  it('calls_action_handlers_from_buttons', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /edit task "alpha"/i }))
    fireEvent.click(screen.getByRole('button', { name: /delete task "alpha"/i }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
