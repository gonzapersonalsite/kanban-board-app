import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/react/sortable'
import { useDragOperation } from '@dnd-kit/react'
import type { ColumnId } from '@/shared/api'
import { ColumnShell } from '@/entities/column'

interface SortableColumnProps {
  columnId: ColumnId
  index: number
  children: ReactNode
}

export function SortableColumn({ columnId, index, children }: SortableColumnProps) {
  const { ref, isDragging } = useSortable({
    id: columnId,
    index,
    type: 'column',
    accept: ['task', 'column'],
    group: 'board',
    data: { columnId },
  })

  const dragOp = useDragOperation()
  const isTaskDropTarget =
    !isDragging &&
    dragOp?.source?.type === 'task' &&
    (dragOp?.target?.id === columnId || dragOp?.target?.data?.columnId === columnId)

  return (
    <ColumnShell isHighlighted={isTaskDropTarget} isDragging={isDragging} contentRef={ref}>
      {children}
    </ColumnShell>
  )
}
