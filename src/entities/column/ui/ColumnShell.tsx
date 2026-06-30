import { type ReactNode, type Ref } from 'react'
import styles from './ColumnShell.module.css'

interface ColumnShellProps {
  children: ReactNode
  isHighlighted?: boolean
  isDragging?: boolean
  contentRef?: Ref<HTMLDivElement>
}

export function ColumnShell({
  children,
  isHighlighted = false,
  isDragging = false,
  contentRef,
}: ColumnShellProps) {
  const classes = [styles.shell, isHighlighted ? styles.highlighted : '', isDragging ? styles.dragging : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  )
}
