import { Download, Share2 } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import { useDataExport } from '../model/exportBackup'
import styles from './DataExportSection.module.css'

export function DataExportSection() {
  const { t } = useTranslation()
  const { canShareBackup, downloadBackup, shareBackup } = useDataExport()

  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <span className={styles.label}>{t('data_portability.title')}</span>
        <p className={styles.description}>{t('data_portability.description')}</p>
      </div>
      <div className={styles.actions}>
        <Button
          size="sm"
          className={styles.actionButton}
          onClick={downloadBackup}
        >
          <Download aria-hidden="true" />
          <span>{t('data_portability.download')}</span>
        </Button>
        {canShareBackup && (
          <Button
            size="sm"
            variant="ghost"
            className={styles.actionButton}
            onClick={() => {
              void shareBackup()
            }}
          >
            <Share2 aria-hidden="true" />
            <span>{t('data_portability.share')}</span>
          </Button>
        )}
      </div>
    </section>
  )
}
