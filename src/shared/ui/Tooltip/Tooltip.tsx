import { useState, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

interface TooltipProps {
  text: string
  children: ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  const show = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top - 6,
        left: rect.left + rect.width / 2,
      })
    }
    setVisible(true)
  }

  const hide = () => setVisible(false)

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span ref={triggerRef} aria-describedby={id} className={styles.trigger}>
        {children}
      </span>
      {visible &&
        createPortal(
          <span
            className={styles.tooltip}
            id={id}
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  )
}
