import { useLocation, useNavigate } from 'react-router-dom'
import { buildBoardPath, resolveFallbackBoardId, useBoards } from '@/entities/board'
import { usePageMeta } from '@/shared/lib'
import { DEFAULT_LOCALE, extractPathLocale, localizePath, useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  usePageMeta({
    title: t('seo.not_found.title'),
    description: t('seo.not_found.description'),
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { boards, activeBoardId } = useBoards()

  const routeLocale = extractPathLocale(location.pathname) ?? DEFAULT_LOCALE
  const fallbackBoardId = resolveFallbackBoardId(boards, activeBoardId)
  const fallbackPath = fallbackBoardId
    ? buildBoardPath('board', fallbackBoardId, routeLocale)
    : localizePath('/', routeLocale)

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('not_found.message')}</p>
      <Button variant="primary" onClick={() => navigate(fallbackPath)}>
        {t('not_found.back_home')}
      </Button>
    </div>
  )
}
