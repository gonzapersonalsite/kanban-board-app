import { type ReactNode } from 'react'
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/react'
import { useBoardDndLifecycle } from '../model/useBoardDndLifecycle'
import { ColumnDragOverlayContent } from './ColumnDragOverlayContent'
import { TaskDragOverlayContent } from './TaskDragOverlayContent'
import styles from './BoardDndContext.module.css'

interface BoardDndContextProps {
  children: ReactNode
}

export function BoardDndContext({ children }: BoardDndContextProps) {
  const { handleDragStart, handleDragOver, handleDragEnd } =
    useBoardDndLifecycle()

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={[PointerSensor, KeyboardSensor]}
    >
      {children}
      <DragOverlay className={styles.overlay}>
        {(source) => (
          <>
            <TaskDragOverlayContent source={source} />
            <ColumnDragOverlayContent source={source} />
          </>
        )}
      </DragOverlay>
    </DragDropProvider>
  )
}
