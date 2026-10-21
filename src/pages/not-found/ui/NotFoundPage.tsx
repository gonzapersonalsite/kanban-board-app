import { useState, type CSSProperties, type DragEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle2, Compass, GripVertical, Home } from 'lucide-react'
import { buildBoardPath, resolveFallbackBoardId, useBoards } from '@/entities/board'
import { usePageMeta } from '@/shared/lib'
import { DEFAULT_LOCALE, extractPathLocale, localizePath, useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui'
import styles from './NotFoundPage.module.css'

type RecoveryCardId = 'home' | 'calendar'

const RECOVERY_CARDS: readonly {
  readonly id: RecoveryCardId
  readonly titleKey: 'not_found.card_home_title' | 'not_found.card_calendar_title'
  readonly accent: string
}[] = [
  {
    id: 'home',
    titleKey: 'not_found.card_home_title',
    accent: '#8b5cf6',
  },
  {
    id: 'calendar',
    titleKey: 'not_found.card_calendar_title',
    accent: '#06b6d4',
  },
]

export function NotFoundPage() {
  const { t } = useTranslation()
  usePageMeta({
    title: t('seo.not_found.title'),
    description: t('seo.not_found.description'),
    robots: 'noindex',
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { boards, activeBoardId } = useBoards()

  const [draggingCard, setDraggingCard] = useState<RecoveryCardId | null>(null)
  const [isOverDone, setIsOverDone] = useState(false)

  const routeLocale = extractPathLocale(location.pathname) ?? DEFAULT_LOCALE
  const fallbackBoardId = resolveFallbackBoardId(boards, activeBoardId)
  const fallbackPath = fallbackBoardId
    ? buildBoardPath('board', fallbackBoardId, routeLocale)
    : localizePath('/', routeLocale)
  const calendarPath = fallbackBoardId
    ? buildBoardPath('calendar', fallbackBoardId, routeLocale)
    : localizePath('/calendar', routeLocale)

  const triggerRecoveryNavigation = (cardId: RecoveryCardId) => {
    setDraggingCard(null)
    setIsOverDone(false)
    navigate(cardId === 'home' ? fallbackPath : calendarPath)
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, cardId: RecoveryCardId) => {
    setDraggingCard(cardId)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', cardId)
    }
  }

  const handleDragEnd = () => {
    setDraggingCard(null)
    setIsOverDone(false)
  }

  const handleDragOverDone = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    if (!isOverDone) {
      setIsOverDone(true)
    }
  }

  const handleDropOnDone = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const transferred = event.dataTransfer?.getData('text/plain')
    const resolvedCard: RecoveryCardId | null =
      transferred === 'home' || transferred === 'calendar' ? transferred : draggingCard
    if (resolvedCard) {
      triggerRecoveryNavigation(resolvedCard)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.badge}>
          <Compass className={styles.badgeIcon} aria-hidden="true" />
          <span>404 · {t('not_found.badge')}</span>
        </span>
        <h1 className={styles.heading}>{t('not_found.heading')}</h1>
        <p className={styles.message}>{t('not_found.message')}</p>
      </div>

      <div className={styles.boardPreview}>
        {/* Column 1: Por hacer [4] */}
        <div className={styles.column} style={{ '--column-accent': '#6366f1' } as CSSProperties}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>{t('seed.column_todo')}</span>
            <span className={styles.columnDigit} aria-hidden="true">
              4
            </span>
          </div>

          <div className={styles.card} style={{ '--card-accent': '#6366f1' } as CSSProperties}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>{t('not_found.card_route_title')}</p>
              <GripVertical className={styles.gripIcon} aria-hidden="true" />
            </div>
            <code className={styles.routeCode}>{location.pathname}</code>
            <div className={styles.cardFooter}>
              <span className={`${styles.statusTag} ${styles.danger}`}>{t('not_found.card_route_tag')}</span>
            </div>
          </div>
        </div>

        {/* Column 2: En curso [0] — Draggable Recovery Cards */}
        <div className={styles.column} style={{ '--column-accent': '#8b5cf6' } as CSSProperties}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>{t('seed.column_in_progress')}</span>
            <span className={styles.columnDigit} aria-hidden="true">
              0
            </span>
          </div>

          <div className={styles.cardStack}>
            {RECOVERY_CARDS.map((card) => {
              const isDragging = draggingCard === card.id
              const CardIcon = card.id === 'home' ? Home : Calendar
              return (
                <div
                  key={card.id}
                  data-testid={`recovery-card-${card.id}`}
                  draggable
                  onDragStart={(event) => handleDragStart(event, card.id)}
                  onDragEnd={handleDragEnd}
                  className={`${styles.card} ${styles.draggableCard} ${isDragging ? styles.dragging : ''}`}
                  style={{ '--card-accent': card.accent } as CSSProperties}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitleWithIcon}>
                      <CardIcon className={styles.cardLeadingIcon} aria-hidden="true" />
                      <span className={styles.cardTitle}>{t(card.titleKey)}</span>
                    </span>
                    <GripVertical className={styles.gripIcon} aria-hidden="true" />
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={`${styles.statusTag} ${styles.warning}`}>{t('not_found.card_drag_tag')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Column 3: Terminado [4] — Interactive Drop Zone */}
        <div
          data-testid="not-found-done-column"
          onDragOver={handleDragOverDone}
          onDragLeave={() => setIsOverDone(false)}
          onDrop={handleDropOnDone}
          className={`${styles.column} ${styles.doneColumn} ${draggingCard ? styles.doneColumnArmed : ''} ${isOverDone ? styles.doneColumnActive : ''}`}
          style={{ '--column-accent': '#10b981' } as CSSProperties}
        >
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>{t('seed.column_done')}</span>
            <span className={styles.columnDigit} aria-hidden="true">
              4
            </span>
          </div>

          <div className={`${styles.dropZone} ${isOverDone ? styles.dropZoneActive : ''}`}>
            <CheckCircle2 className={styles.dropZoneIcon} aria-hidden="true" />
            <p className={styles.dropZoneText}>
              {isOverDone || draggingCard ? t('not_found.drop_zone_active') : t('not_found.drop_zone_hint')}
            </p>
            <span className={`${styles.statusTag} ${styles.success}`}>{t('not_found.card_recover_tag')}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate(fallbackPath)}>
          <ArrowLeft aria-hidden="true" />
          <span>{t('not_found.back_home')}</span>
        </Button>
        <Button variant="ghost" onClick={() => navigate(calendarPath)}>
          <Calendar aria-hidden="true" />
          <span>{t('not_found.open_calendar')}</span>
        </Button>
      </div>
    </section>
  )
}
