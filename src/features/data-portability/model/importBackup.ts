import { useState } from 'react'
import {
  type PortableKanbanState,
  restoreKanbanState,
} from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'
import {
  type KanbanSnapshot,
  deserializeKanbanSnapshot,
} from './snapshot'
import type { KanbanSnapshotError } from './types'

export const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024

export interface BackupSummary {
  exportedAt: string
  boardCount: number
  columnCount: number
  taskCount: number
}

export interface BackupImportPreview {
  fileName: string
  snapshot: KanbanSnapshot
  summary: BackupSummary
}

interface UseDataImportOptions {
  onImportComplete?: (state: PortableKanbanState) => void
}

export class BackupFileError extends Error {
  readonly code: 'file_too_large' | 'file_read_failed'

  constructor(code: 'file_too_large' | 'file_read_failed', message: string) {
    super(message)
    this.name = 'BackupFileError'
    this.code = code
  }
}

export function useDataImport(options: UseDataImportOptions = {}) {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<BackupImportPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  const selectFile = (file: File | null) => {
    setSelectedFile(file)
    setPreview(null)
    setError(null)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    setInputKey((current) => current + 1)
  }

  const cancelImport = () => {
    clearSelection()
    useToastStore.getState().addNotification('info', t('feedback.backup_import_cancelled'))
  }

  const reviewSelectedFile = async () => {
    if (!selectedFile) {
      return
    }

    setIsReviewing(true)
    setError(null)

    try {
      const nextPreview = await parseBackupFile(selectedFile)
      setPreview(nextPreview)
      useToastStore.getState().addNotification('info', t('feedback.backup_review_ready'))
    } catch (error) {
      const message = resolveImportErrorMessage(error, t)
      setPreview(null)
      setError(message)
      useToastStore.getState().addNotification('error', message)
    } finally {
      setIsReviewing(false)
    }
  }

  const confirmImport = () => {
    if (!preview) {
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      const restoredState = restoreKanbanState(preview.snapshot)
      useToastStore.getState().addNotification('success', t('feedback.backup_imported'))
      clearSelection()
      options.onImportComplete?.(restoredState)
    } catch (error) {
      const message = resolveImportErrorMessage(error, t)
      setError(message)
      useToastStore.getState().addNotification('error', message)
    } finally {
      setIsImporting(false)
    }
  }

  return {
    inputKey,
    selectedFile,
    preview,
    error,
    isReviewing,
    isImporting,
    selectFile,
    clearSelection,
    cancelImport,
    reviewSelectedFile,
    confirmImport,
  }
}

export async function parseBackupFile(file: File): Promise<BackupImportPreview> {
  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
    throw new BackupFileError('file_too_large', 'Selected backup file is too large.')
  }

  let serialized: string

  try {
    serialized = await file.text()
  } catch {
    throw new BackupFileError('file_read_failed', 'Selected backup file could not be read.')
  }

  const snapshot = deserializeKanbanSnapshot(serialized)

  return {
    fileName: file.name,
    snapshot,
    summary: summarizeKanbanSnapshot(snapshot),
  }
}

export function summarizeKanbanSnapshot(snapshot: KanbanSnapshot): BackupSummary {
  const boardCount = snapshot.boards.length
  const columnCount = Object.values(snapshot.columnsByBoard).reduce(
    (total, columns) => total + columns.length,
    0,
  )
  const taskCount = Object.values(snapshot.tasksByBoard).reduce(
    (boardTotal, tasksByColumn) =>
      boardTotal +
      Object.values(tasksByColumn).reduce(
        (columnTotal, tasks) => columnTotal + tasks.length,
        0,
      ),
    0,
  )

  return {
    exportedAt: snapshot.exportedAt,
    boardCount,
    columnCount,
    taskCount,
  }
}

function resolveImportErrorMessage(
  error: unknown,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (isSnapshotError(error)) {
    switch (error.code) {
      case 'invalid_json':
        return t('data_portability.import_error_invalid_json')
      case 'unsupported_schema_version':
        return t('data_portability.import_error_unsupported_version')
      case 'invalid_snapshot':
        return t('data_portability.import_error_invalid_snapshot')
      default:
        return t('feedback.backup_import_error')
    }
  }

  if (isBackupFileError(error)) {
    switch (error.code) {
      case 'file_too_large':
        return t('data_portability.import_error_file_too_large')
      case 'file_read_failed':
        return t('data_portability.import_error_read_failed')
      default:
        return t('feedback.backup_import_error')
    }
  }

  return t('feedback.backup_import_error')
}

function isSnapshotError(error: unknown): error is KanbanSnapshotError {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'KanbanSnapshotError' &&
    'code' in error
  )
}

function isBackupFileError(error: unknown): error is BackupFileError {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'BackupFileError' &&
    'code' in error
  )
}
