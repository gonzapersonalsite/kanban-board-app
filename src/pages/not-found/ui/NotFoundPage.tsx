import { useNavigate } from 'react-router-dom'
import { resolveFallbackBoardId, useBoards } from '@/entities/board'
import { usePageMeta } from '@/shared/lib'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  usePageMeta({
    title: t('seo.not_found.title'),
    description: t('seo.not_found.description'),
  })
  const navigate = useNavigate()
  const { boards, activeBoardId } = useBoards()

  const fallbackBoardId = resolveFallbackBoardId(boards, activeBoardId)

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('not_found.message')}</p>
      <Button
        variant="primary"
        onClick={() =>
          navigate(fallbackBoardId ? `/board/${fallbackBoardId}` : '/')
        }
      >
        {t('not_found.back_home')}
      </Button>
    </div>
  )
}
