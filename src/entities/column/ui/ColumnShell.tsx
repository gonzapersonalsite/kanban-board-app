import { type HTMLAttributes, type ReactNode, type Ref } from 'react'
import styles from './ColumnShell.module.css'

interface ColumnShellProps {
  children: ReactNode
  isHighlighted?: boolean
  isDragging?: boolean
  contentRef?: Ref<HTMLDivElement>
  contentAriaProps?: Pick<
    HTMLAttributes<HTMLDivElement>,
    'aria-roledescription' | 'aria-describedby'
  >
  accentColor?: string
}

export function ColumnShell({
  children,
  isHighlighted = false,
  isDragging = false,
  contentRef,
  contentAriaProps,
  accentColor,
}: ColumnShellProps) {
  const classes = [styles.shell, isHighlighted ? styles.highlighted : '', isDragging ? styles.dragging : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={accentColor ? { '--column-accent': accentColor } as React.CSSProperties : undefined}>
      <div ref={contentRef} className={styles.content} {...contentAriaProps}>
        {children}
      </div>
    </div>
  )
}
