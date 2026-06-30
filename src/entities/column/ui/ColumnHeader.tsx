import { useState, type KeyboardEvent } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Column } from '@/shared/api'
import { IconButton } from '@/shared/ui'
import { Input } from '@/shared/ui'
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
          <IconButton icon={<Check size={16} />} label="Save title" onClick={handleSave} />
          <IconButton icon={<X size={16} />} label="Cancel edit" onClick={handleCancel} />
        </div>
      ) : (
        <div className={styles.displayRow}>
          <button
            type="button"
            className={styles.titleButton}
            onClick={handleStartEdit}
          >
            <span className={styles.title}>{column.title}</span>
            <Pencil size={13} className={styles.editIcon} />
          </button>
          {canDelete && (
            <IconButton
              icon={<Trash2 size={15} />}
              label={`Delete column "${column.title}"`}
              variant="danger"
              onClick={onDelete}
            />
          )}
        </div>
      )}
    </div>
  )
}
