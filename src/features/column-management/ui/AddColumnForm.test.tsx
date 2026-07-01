import { fireEvent, screen } from '@testing-library/react'
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
    expect(
      useKanbanStore
        .getState()
        .columnsByBoard[BOARD_MAIN_ID]
        .some((column) => column.title === 'Review'),
    ).toBe(true)
  })

  it('does_not_create_a_column_when_title_is_blank', () => {
    renderWithKanban(<AddColumnForm />)
    const before = useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID].length

    fireEvent.click(screen.getByRole('button', { name: /add column/i }))

    expect(useKanbanStore.getState().columnsByBoard[BOARD_MAIN_ID]).toHaveLength(before)
  })
})
