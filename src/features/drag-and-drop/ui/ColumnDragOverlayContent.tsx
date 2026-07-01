import type { DragOverEvent } from '@dnd-kit/react'
import { useKanbanStore } from '@/shared/api'
import { selectActiveBoardColumns } from '@/entities/board'
import styles from './BoardDndContext.module.css'

interface ColumnDragOverlayContentProps {
  source: DragOverEvent['operation']['source'] | null
}

export function ColumnDragOverlayContent({
  source,
}: ColumnDragOverlayContentProps) {
  if (!source || source.type !== 'column') return null

  const columnId = String(source.id)
  const state = useKanbanStore.getState()
  const columns = selectActiveBoardColumns(state)
  const column = columns.find((item) => item.id === columnId)

  if (!column) return null

  return <div className={styles.overlayColumn}>{column.title}</div>
}
