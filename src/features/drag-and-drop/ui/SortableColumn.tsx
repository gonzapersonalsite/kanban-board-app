import { type ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/react'
import type { ColumnId } from '@/shared/api'
import { ColumnShell } from '@/entities/column'

interface SortableColumnProps {
  columnId: ColumnId
  children: ReactNode
}

export function SortableColumn({ columnId, children }: SortableColumnProps) {
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: columnId,
    type: 'column',
    accept: ['task'],
    data: { columnId },
  })

  return (
    <ColumnShell isHighlighted={isDropTarget} contentRef={droppableRef}>
      {children}
    </ColumnShell>
  )
}
