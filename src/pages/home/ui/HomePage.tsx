import { usePageMeta } from '@/shared/lib'
import { useTranslation } from '@/shared/i18n'
import { Board } from '@/widgets/board'
import styles from './HomePage.module.css'

export function HomePage() {
  const { t } = useTranslation()
  usePageMeta({
    title: t('seo.board.title'),
    description: t('seo.board.description'),
  })

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>{t('seo.board.title')}</h1>
      <Board />
    </div>
  )
}
