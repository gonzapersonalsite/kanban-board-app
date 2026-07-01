import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('not_found.message')}</p>
      <Button variant="primary" onClick={() => navigate('/')}>
        {t('not_found.back_home')}
      </Button>
    </div>
  )
}
