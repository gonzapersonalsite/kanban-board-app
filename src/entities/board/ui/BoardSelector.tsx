import type { ReactNode } from 'react'
import type { BoardId, Board } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import styles from './BoardSelector.module.css'

interface BoardSelectorProps {
  boards: Board[]
  activeBoardId: BoardId | null
  onBoardChange: (boardId: BoardId) => void
  actions?: ReactNode
  className?: string
}

export function BoardSelector({
  boards,
  activeBoardId,
  onBoardChange,
  actions,
  className,
}: BoardSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className={[styles.selector, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor="board-selector">
        {t('board.switch_board')}
      </label>
      <select
        id="board-selector"
        className={styles.select}
        aria-label={t('board.switch_board')}
        value={activeBoardId ?? ''}
        onChange={(event) => onBoardChange(event.target.value)}
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.title}
          </option>
        ))}
      </select>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}
