import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../IconButton'
import { DIALOG_INITIAL_FOCUS_SELECTOR } from './initialFocus'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  closeLabel: string
}

export function Dialog({ open, onClose, title, children, closeLabel }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      openerRef.current = document.activeElement
      dialog.showModal()
      // showModal() leaves the focus on the first control, the close button.
      dialog.querySelector<HTMLElement>(DIALOG_INITIAL_FOCUS_SELECTOR)?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }

    // The browser returns the focus to the opener only when a modal dialog is closed, and this one
    // leaves by being removed: the focus goes back here, once the page is no longer inert behind it.
    return () => {
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return

      const rect = dialog.getBoundingClientRect()
      const isInside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (!isInside) {
        onClose()
      }
    }

    dialog.addEventListener('click', handleBackdropClick)
    return () => dialog.removeEventListener('click', handleBackdropClick)
  }, [onClose])

  if (!open) return null

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <IconButton icon={<X />} label={closeLabel} onClick={onClose} />
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  )
}
