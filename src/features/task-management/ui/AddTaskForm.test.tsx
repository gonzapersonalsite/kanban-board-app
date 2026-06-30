import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AddTaskForm } from '@/features/task-management/ui/AddTaskForm'
import { COLUMN_TODO_ID } from '@/test/fixtures/kanbanFixtures'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'
import { useKanbanStore } from '@/shared/api'

describe('AddTaskForm', () => {
  it('creates_a_task_when_submitting_a_valid_title', () => {
    renderWithKanban(<AddTaskForm columnId={COLUMN_TODO_ID} />)

    fireEvent.change(screen.getByLabelText('Task title'), {
      target: { value: 'Quick task' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add card/i }))

    const created = useKanbanStore
      .getState()
      .tasks[COLUMN_TODO_ID]
      .find((task) => task.title === 'Quick task')

    expect(created).toBeDefined()
    expect(screen.getByLabelText('Task title')).toHaveValue('')
  })

  it('does_not_create_a_task_when_title_is_blank', () => {
    renderWithKanban(<AddTaskForm columnId={COLUMN_TODO_ID} />)
    const before = useKanbanStore.getState().tasks[COLUMN_TODO_ID].length

    fireEvent.click(screen.getByRole('button', { name: /add card/i }))

    expect(useKanbanStore.getState().tasks[COLUMN_TODO_ID]).toHaveLength(before)
  })
})
