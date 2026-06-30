import { type ReactNode, type Ref } from 'react'
import styles from './ColumnShell.module.css'

interface ColumnShellProps {
  children: ReactNode
  isHighlighted?: boolean
  contentRef?: Ref<HTMLDivElement>
}

export function ColumnShell({
  children,
  isHighlighted = false,
  contentRef,
}: ColumnShellProps) {
  const classes = [styles.shell, isHighlighted ? styles.highlighted : '']
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
