import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ColumnHeader } from '@/entities/column/ui/ColumnHeader'
import { COLUMN_TODO_ID, fixtureColumns } from '@/test/fixtures/kanbanFixtures'

describe('ColumnHeader', () => {
  const column = fixtureColumns.find((item) => item.id === COLUMN_TODO_ID)!

  it('calls_onRename_with_trimmed_title_after_edit', () => {
    const onRename = vi.fn()

    render(
      <ColumnHeader
        column={column}
        onRename={onRename}
        onDelete={vi.fn()}
        canDelete={false}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /to do/i }))
    fireEvent.change(screen.getByDisplayValue('To Do'), {
      target: { value: '  Backlog  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save title/i }))

    expect(onRename).toHaveBeenCalledWith('Backlog')
  })

  it('shows_delete_action_only_when_column_can_be_deleted', () => {
    const { rerender } = render(
      <ColumnHeader
        column={column}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        canDelete={false}
      />,
    )

    expect(screen.queryByRole('button', { name: /delete column/i })).toBeNull()

    rerender(
      <ColumnHeader
        column={column}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        canDelete
      />,
    )

    expect(
      screen.getByRole('button', { name: /delete column "to do"/i }),
    ).toBeInTheDocument()
  })
})
