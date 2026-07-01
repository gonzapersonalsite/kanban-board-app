import { useKanbanStore } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { useToastStore } from '@/shared/ui'
import { createKanbanSnapshot, serializeKanbanSnapshot } from './snapshot'

const BACKUP_FILE_PREFIX = 'kanban-board-backup'
const JSON_MIME_TYPE = 'application/json'

export function useDataExport() {
  const { t } = useTranslation()

  const downloadBackup = () => {
    try {
      const file = createBackupFile()
      downloadFile(file)
      useToastStore.getState().addNotification('success', t('feedback.backup_downloaded'))
    } catch {
      useToastStore.getState().addNotification('error', t('feedback.backup_export_error'))
    }
  }

  const shareBackup = async () => {
    if (!supportsFileShare()) {
      return
    }

    const file = createBackupFile()

    try {
      await navigator.share({
        title: t('data_portability.share_title'),
        text: t('data_portability.share_text'),
        files: [file],
      })

      useToastStore.getState().addNotification('success', t('feedback.backup_shared'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      downloadFile(file)
      useToastStore.getState().addNotification('info', t('feedback.backup_share_fallback_downloaded'))
    }
  }

  return {
    canShareBackup: supportsFileShare(),
    downloadBackup,
    shareBackup,
  }
}

export function createBackupFile(): File {
  const portableState = useKanbanStore.getState()
  const snapshot = createKanbanSnapshot(portableState)
  const serialized = serializeKanbanSnapshot(snapshot)
  const fileName = buildBackupFileName(snapshot.exportedAt)

  return new File([serialized], fileName, { type: JSON_MIME_TYPE })
}

export function buildBackupFileName(exportedAt: string): string {
  const safeTimestamp = exportedAt
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/:/g, '-')

  return `${BACKUP_FILE_PREFIX}-${safeTimestamp}.json`
}

export function supportsFileShare(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function' ||
    typeof File === 'undefined' ||
    !isLikelyNativeShareDevice()
  ) {
    return false
  }

  return navigator.canShare({
    files: [new File(['{}'], 'kanban-board-backup.json', { type: JSON_MIME_TYPE })],
  })
}

function isLikelyNativeShareDevice(): boolean {
  const userAgentData = navigator as Navigator & {
    userAgentData?: { mobile?: boolean }
  }

  if (userAgentData.userAgentData?.mobile) {
    return true
  }

  if (navigator.maxTouchPoints > 0) {
    return true
  }

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function downloadFile(file: File) {
  const objectUrl = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = file.name
  link.click()

  queueMicrotask(() => {
    URL.revokeObjectURL(objectUrl)
  })
}
