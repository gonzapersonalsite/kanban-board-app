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
      <Board />
    </div>
  )
}
