import { useTranslation } from '@/shared/i18n'
import styles from './EmptyColumnMessage.module.css'

export function EmptyColumnMessage() {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <svg
        className={styles.illustration}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M8 36c2-4 6-8 12-8s10 4 12 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="8"
          x2="20"
          y2="24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="6" r="2" fill="currentColor" />
        <path
          d="M14 24c-1.5 0-3 1-3 3s1.5 3 3 3M26 24c1.5 0 3 1 3 3s-1.5 3-3 3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <p className={styles.message}>{t('board.empty_column')}</p>
    </div>
  )
}
