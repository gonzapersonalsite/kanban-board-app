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

    expect(onSave).toHaveBeenCalledWith('Updated title', 'Existing description')
  })

  it('does_not_submit_when_title_is_blank', () => {
    const onSave = vi.fn()

    renderWithKanban(
      <TaskDialog open onClose={vi.fn()} onSave={onSave} initialTitle="Existing" />,
    )

    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls_onClose_when_cancel_is_clicked', () => {
    const onClose = vi.fn()

    renderWithKanban(
      <TaskDialog open onClose={onClose} onSave={vi.fn()} initialTitle="Existing" />,
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
