import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Dialog } from './Dialog'

function DialogUnmountedByItsOwner() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open settings
      </button>
      {isOpen && (
        <Dialog open={true} onClose={() => setIsOpen(false)} title="Settings">
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
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Settings">
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
})
