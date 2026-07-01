import { Upload, TriangleAlert } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import { useDataImport } from '../model/importBackup'
import type { PortableKanbanState } from '@/shared/api'
import styles from './DataImportSection.module.css'

interface DataImportSectionProps {
  onImportComplete?: (state: PortableKanbanState) => void
}

export function DataImportSection({ onImportComplete }: DataImportSectionProps) {
  const { t, locale } = useTranslation()
  const {
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
  } = useDataImport({ onImportComplete })

  const formattedExportedAt = preview
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(preview.summary.exportedAt))
    : null

  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <span className={styles.label}>{t('data_portability.import_title')}</span>
        <p className={styles.description}>{t('data_portability.import_description')}</p>
      </div>

      <div className={styles.filePicker}>
        <label className={styles.fileLabel} htmlFor="backup-file-input">
          {t('data_portability.select_file')}
        </label>
        <input
          key={inputKey}
          id="backup-file-input"
          className={styles.fileInput}
          type="file"
          accept=".json,application/json"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {selectedFile && (
        <div className={styles.selectedFile}>
          <span className={styles.fileName}>
            {t('data_portability.selected_file', { fileName: selectedFile.name })}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
          >
            {t('data_portability.clear_selection')}
          </Button>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          size="sm"
          className={styles.actionButton}
          onClick={() => {
            void reviewSelectedFile()
          }}
          disabled={!selectedFile || isReviewing}
        >
          <Upload size={16} aria-hidden="true" />
          <span>
            {isReviewing
              ? t('data_portability.review_loading')
              : t('data_portability.review')}
          </span>
        </Button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {preview && formattedExportedAt && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>{t('data_portability.preview_title')}</span>
            <span className={styles.previewFileName}>{preview.fileName}</span>
          </div>

          <dl className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <dt>{t('data_portability.summary_exported_at')}</dt>
              <dd>{formattedExportedAt}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t('data_portability.summary_boards')}</dt>
              <dd>{preview.summary.boardCount}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t('data_portability.summary_columns')}</dt>
              <dd>{preview.summary.columnCount}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t('data_portability.summary_tasks')}</dt>
              <dd>{preview.summary.taskCount}</dd>
            </div>
          </dl>

          <div className={styles.warningBox} role="alert">
            <TriangleAlert size={18} aria-hidden="true" />
            <p>{t('data_portability.import_warning')}</p>
          </div>

          <div className={styles.confirmActions}>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelImport}
            >
              {t('data_portability.cancel_import')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={confirmImport}
              disabled={isImporting}
            >
              {isImporting
                ? t('data_portability.import_loading')
                : t('data_portability.confirm_import')}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
