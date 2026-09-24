import { type ReactNode } from 'react'
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/react'
import { useTranslation } from '@/shared/i18n'
import {
  BOARD_DND_INSTRUCTIONS_ID,
  withBoardDndAnnouncements,
} from '../model/boardDndAccessibility'
import { useBoardDndLifecycle } from '../model/useBoardDndLifecycle'
import { ColumnDragOverlayContent } from './ColumnDragOverlayContent'
import { TaskDragOverlayContent } from './TaskDragOverlayContent'
import styles from './BoardDndContext.module.css'

interface BoardDndContextProps {
  children: ReactNode
}

export function BoardDndContext({ children }: BoardDndContextProps) {
  const { t } = useTranslation()
  const { handleDragStart, handleDragOver, handleDragEnd } =
    useBoardDndLifecycle()

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={[PointerSensor, KeyboardSensor]}
      plugins={withBoardDndAnnouncements}
    >
      {children}
      <p id={BOARD_DND_INSTRUCTIONS_ID} hidden>
        {t('dnd.instructions')}
      </p>
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
