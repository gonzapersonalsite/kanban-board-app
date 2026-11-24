import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Dialog } from './Dialog'
import { DIALOG_INITIAL_FOCUS } from './initialFocus'

function DialogUnmountedByItsOwner() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open settings
      </button>
      {isOpen && (
        <Dialog open={true} onClose={() => setIsOpen(false)} title="Settings" closeLabel="Close dialog">
          <p>Content</p>
        </Dialog>
      )}
    </>
  )
}

function DialogKeptMountedByItsOwner() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open settings
      </button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Settings" closeLabel="Close dialog">
        <p>Content</p>
      </Dialog>
    </>
  )
}

function openFromTheKeyboard() {
  const opener = screen.getByRole('button', { name: 'Open settings' })
  opener.focus()
  fireEvent.click(opener)
  const closeButton = screen.getByRole('button', { name: 'Close dialog' })
  closeButton.focus()

  return { opener, closeButton }
}

describe('Dialog', () => {
  it('returns_the_focus_to_its_opener_when_its_owner_unmounts_it', () => {
    render(<DialogUnmountedByItsOwner />)
    const { opener, closeButton } = openFromTheKeyboard()

    fireEvent.click(closeButton)

    expect(opener).toHaveFocus()
  })

  it('returns_the_focus_to_its_opener_when_its_owner_keeps_it_mounted_and_closes_it', () => {
    render(<DialogKeptMountedByItsOwner />)
    const { opener, closeButton } = openFromTheKeyboard()

    fireEvent.click(closeButton)

    expect(opener).toHaveFocus()
  })

  it('moves_the_focus_to_the_control_its_content_marks_when_it_opens', () => {
    render(
      <Dialog open={true} onClose={() => undefined} title="Rename board" closeLabel="Close dialog">
        <input aria-label="Board name" {...DIALOG_INITIAL_FOCUS} />
        <button type="button">Save</button>
      </Dialog>,
    )

    expect(screen.getByRole('textbox', { name: 'Board name' })).toHaveFocus()
  })

  it('leaves_the_focus_where_the_browser_puts_it_when_its_content_marks_no_control', () => {
    render(
      <Dialog open={true} onClose={() => undefined} title="Settings" closeLabel="Close dialog">
        <button type="button">Save</button>
      </Dialog>,
    )

    expect(document.body).toHaveFocus()
  })

  it('takes_its_title_as_its_accessible_name', () => {
    render(
      <Dialog open={true} onClose={() => undefined} title="Settings" closeLabel="Close dialog">
        <p>Content</p>
      </Dialog>,
    )

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })

  it('names_each_dialog_by_its_own_title_when_two_dialogs_share_a_page', () => {
    render(
      <>
        <Dialog open={true} onClose={() => undefined} title="First" closeLabel="Close dialog">
          <p>Content</p>
        </Dialog>
        <Dialog open={true} onClose={() => undefined} title="Second" closeLabel="Close dialog">
          <p>Content</p>
        </Dialog>
      </>,
    )

    const titlesNamingEachDialog = screen
      .getAllByRole('dialog')
      .map((dialog) => document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent)

    expect(titlesNamingEachDialog).toEqual(['First', 'Second'])
  })
})
