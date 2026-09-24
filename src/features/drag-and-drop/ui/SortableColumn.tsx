import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/react/sortable'
import { useDragOperation } from '@dnd-kit/react'
import type { ColumnId } from '@/shared/api'
import { ColumnShell } from '@/entities/column'
import { useTranslation } from '@/shared/i18n'
import { BOARD_DND_INSTRUCTIONS_ID } from '../model/boardDndAccessibility'

interface SortableColumnProps {
  columnId: ColumnId
  index: number
  children: ReactNode
  accentColor?: string
}

export function SortableColumn({ columnId, index, children, accentColor }: SortableColumnProps) {
  const { t } = useTranslation()
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
    <ColumnShell
      isHighlighted={isTaskDropTarget}
      isDragging={isDragging}
      contentRef={ref}
      contentAriaProps={{
        'aria-roledescription': t('dnd.role_description'),
        'aria-describedby': BOARD_DND_INSTRUCTIONS_ID,
      }}
      accentColor={accentColor}
    >
      {children}
    </ColumnShell>
  )
}
