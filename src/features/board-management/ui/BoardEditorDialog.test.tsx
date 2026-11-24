import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BoardEditorDialog } from './BoardEditorDialog'

function EditorWithError({ title }: { title: string }) {
  return (
    <BoardEditorDialog
      open={true}
      title={title}
      closeLabel="Close dialog"
      value=""
      placeholder="Board name..."
      error="Title cannot be empty"
      cancelLabel="Cancel"
      submitLabel="Save"
      onChange={() => {}}
      onClose={() => {}}
      onSubmit={() => {}}
    />
  )
}

describe('BoardEditorDialog', () => {
  it('describes_each_field_with_the_error_of_its_own_dialog_when_two_dialogs_share_a_page', () => {
    render(
      <>
        <EditorWithError title="New board" />
        <EditorWithError title="Rename board" />
      </>,
    )

    const errorsInsideTheirOwnDialog = screen.getAllByRole('dialog').map((dialog) => {
      const field = within(dialog).getByRole('textbox')
      return dialog.contains(document.getElementById(field.getAttribute('aria-describedby') ?? ''))
    })

    expect(errorsInsideTheirOwnDialog).toEqual([true, true])
  })

  it('opens_with_the_focus_on_the_name_of_the_board', () => {
    render(<EditorWithError title="New board" />)

    expect(screen.getByRole('textbox', { name: 'New board' })).toHaveFocus()
  })
})
