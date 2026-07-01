import { useLayoutEffect, useState, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

interface TooltipProps {
  text: string
  children: ReactNode
}

type TooltipPlacement = 'top' | 'bottom'

const TOOLTIP_GAP = 6
const VIEWPORT_PADDING = 8

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placement: 'top' as TooltipPlacement,
  })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  const show = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top - TOOLTIP_GAP,
        left: rect.left + rect.width / 2,
        placement: 'top',
      })
    }
    setVisible(true)
  }

  const hide = () => setVisible(false)

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const fitsAbove =
      triggerRect.top >= tooltipRect.height + TOOLTIP_GAP + VIEWPORT_PADDING

    const centeredLeft = triggerRect.left + triggerRect.width / 2
    const clampedLeft = Math.min(
      Math.max(centeredLeft, tooltipRect.width / 2 + VIEWPORT_PADDING),
      window.innerWidth - tooltipRect.width / 2 - VIEWPORT_PADDING,
    )

    setCoords({
      top: fitsAbove
        ? triggerRect.top - TOOLTIP_GAP
        : triggerRect.bottom + TOOLTIP_GAP,
      left: clampedLeft,
      placement: fitsAbove ? 'top' : 'bottom',
    })
  }, [text, visible])

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
            ref={tooltipRef}
            className={styles.tooltip}
            data-placement={coords.placement}
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
