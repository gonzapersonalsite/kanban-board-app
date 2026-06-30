import { useTranslation } from '@/shared/i18n'
import styles from './EmptyColumnMessage.module.css'

export function EmptyColumnMessage() {
  const { t } = useTranslation()

  return <p className={styles.message}>{t('board.empty_column')}</p>
}
