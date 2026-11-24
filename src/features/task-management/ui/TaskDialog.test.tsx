import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskDialog } from '@/features/task-management/ui/TaskDialog'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'

describe('TaskDialog', () => {
  it('calls_onSave_with_trimmed_values_when_form_is_submitted', () => {
    const onSave = vi.fn()

    renderWithKanban(
      <TaskDialog
        open
        onClose={vi.fn()}
        onSave={onSave}
        initialTitle="Existing"
        initialDescription="Existing description"
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: '  Updated title  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith('Updated title', 'Existing description', '')
  })

  it('does_not_submit_when_title_is_blank', () => {
    const onSave = vi.fn()

    renderWithKanban(<TaskDialog open onClose={vi.fn()} onSave={onSave} initialTitle="Existing" />)

    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls_onClose_when_cancel_is_clicked', () => {
    const onClose = vi.fn()

    renderWithKanban(<TaskDialog open onClose={onClose} onSave={vi.fn()} initialTitle="Existing" />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('takes_no_due_date_with_a_year_longer_than_the_screens_can_show', () => {
    renderWithKanban(<TaskDialog open onClose={vi.fn()} onSave={vi.fn()} initialTitle="Existing" />)

    expect(screen.getByLabelText('Due date')).toHaveAttribute('max', '9999-12-31')
  })

  it('opens_with_the_focus_on_the_title_of_the_task', () => {
    renderWithKanban(<TaskDialog open onClose={vi.fn()} onSave={vi.fn()} initialTitle="Existing" />)

    expect(screen.getByPlaceholderText('Task title')).toHaveFocus()
  })
})
