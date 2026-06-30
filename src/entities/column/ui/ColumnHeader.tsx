import { useState, type KeyboardEvent } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Column } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { IconButton, Input, Tooltip } from '@/shared/ui'
import styles from './ColumnHeader.module.css'

interface ColumnHeaderProps {
  column: Column
  onRename: (title: string) => void
  onDelete: () => void
  canDelete: boolean
}

export function ColumnHeader({
  column,
  onRename,
  onDelete,
  canDelete,
}: ColumnHeaderProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(column.title)

  const handleStartEdit = () => {
    setDraftTitle(column.title)
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmed = draftTitle.trim()
    if (trimmed && trimmed !== column.title) {
      onRename(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftTitle(column.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={styles.header}>
      {isEditing ? (
        <div className={styles.editRow}>
          <Input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className={styles.editInput}
          />
          <Tooltip text={t('column.save_title')}>
            <IconButton icon={<Check size={16} />} label={t('column.save_title')} onClick={handleSave} />
          </Tooltip>
          <Tooltip text={t('column.cancel_edit')}>
            <IconButton icon={<X size={16} />} label={t('column.cancel_edit')} onClick={handleCancel} />
          </Tooltip>
        </div>
      ) : (
        <div className={styles.displayRow}>
          <Tooltip text={t('column.rename')}>
            <button
              type="button"
              className={styles.titleButton}
              aria-label={t('column.rename')}
              onClick={handleStartEdit}
            >
              <span className={styles.title}>{column.title}</span>
              <Pencil size={13} className={styles.editIcon} />
            </button>
          </Tooltip>
          {canDelete && (
            <Tooltip text={t('column.delete', { title: column.title })}>
              <IconButton
                icon={<Trash2 size={15} />}
                label={t('column.delete', { title: column.title })}
                variant="danger"
                onClick={onDelete}
              />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}
