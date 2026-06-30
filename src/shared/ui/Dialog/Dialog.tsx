import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../IconButton'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype
    if (supportsClosedBy) return

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

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      closedby="any"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <IconButton
          icon={<X size={18} />}
          label="Close dialog"
          onClick={onClose}
        />
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  )
}
