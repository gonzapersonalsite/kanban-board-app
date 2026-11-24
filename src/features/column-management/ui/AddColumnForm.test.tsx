import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AddColumnForm } from '@/features/column-management/ui/AddColumnForm'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'
import { useKanbanStore } from '@/shared/api'

describe('AddColumnForm', () => {
  it('creates_a_column_when_submitting_a_valid_title', () => {
    renderWithKanban(<AddColumnForm />)
    const before = useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID].length

    fireEvent.change(screen.getByLabelText('Column title'), {
      target: { value: 'Review' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add column/i }))

    expect(useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID]).toHaveLength(before + 1)
    expect(useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID].some((column) => column.title === 'Review')).toBe(
      true,
    )
  })

  it('does_not_create_a_column_when_title_is_blank', () => {
    renderWithKanban(<AddColumnForm />)
    const before = useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID].length

    fireEvent.click(screen.getByRole('button', { name: /add column/i }))

    expect(useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID]).toHaveLength(before)
  })

  it('describes_each_field_with_the_error_of_its_own_form_when_two_forms_share_a_page', () => {
    renderWithKanban(
      <>
        <section aria-label="First form">
          <AddColumnForm />
        </section>
        <section aria-label="Second form">
          <AddColumnForm />
        </section>
      </>,
    )

    screen.getAllByRole('button', { name: /add column/i }).forEach((button) => fireEvent.click(button))

    const errorsInsideTheirOwnForm = screen.getAllByRole('region').map((form) => {
      const field = within(form).getByLabelText('Column title')
      return form.contains(document.getElementById(field.getAttribute('aria-describedby') ?? ''))
    })
    expect(errorsInsideTheirOwnForm).toEqual([true, true])
  })
})
