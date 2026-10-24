import { useTranslation } from '@/shared/i18n'
import { AppIcon } from '../AppIcon'
import styles from './Credits.module.css'

const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'
const GITHUB_URL = 'https://github.com/gonzapersonalsite'
const EMAIL = 'gonzalomartinezg2001@gmail.com'

export function Credits() {
  const { t } = useTranslation()

  return (
    <div className={styles.credits}>
      <div className={styles.identity}>
        <AppIcon />
        <div className={styles.identityText}>
          <p className={styles.name}>Gonzalo Martínez García</p>
          <p className={styles.role}>{t('credits.role')}</p>
        </div>
      </div>
      <p className={styles.note}>{t('credits.note')}</p>
      <div className={styles.links}>
        <a className={styles.link} href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
          Portfolio
        </a>
        <a className={styles.link} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className={styles.link} href={`mailto:${EMAIL}`}>
          {t('credits.email')}
        </a>
      </div>
    </div>
  )
}
