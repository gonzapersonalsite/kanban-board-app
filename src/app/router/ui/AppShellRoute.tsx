import { Suspense, type CSSProperties } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { stripLocalePrefix } from '@/shared/i18n'
import { Header } from '@/widgets/header'
import { useSyncLocaleRoute } from '../model/useSyncLocaleRoute'
import styles from './AppShellRoute.module.css'

const BOARD_SKELETON_COLUMNS: readonly { readonly accent: string; readonly cards: number }[] = [
  { accent: '#6366f1', cards: 3 },
  { accent: '#8b5cf6', cards: 2 },
  { accent: '#a78bfa', cards: 2 },
]

const CALENDAR_SKELETON_WEEKDAYS = 7
const CALENDAR_SKELETON_DAYS = 35
const CALENDAR_TASK_PILL_COUNTS: Readonly<Record<number, number>> = {
  2: 1,
  5: 2,
  9: 1,
  14: 2,
  18: 1,
  23: 1,
  27: 2,
}

export function BoardRouteSkeleton() {
  return (
    <div
      className={styles.boardSkeleton}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="board-route-skeleton"
    >
      {BOARD_SKELETON_COLUMNS.map((column, colIndex) => (
        <div
          key={colIndex}
          className={styles.boardColumn}
          style={{ '--column-accent': column.accent } as CSSProperties}
        >
          <div className={styles.boardColumnHeader}>
            <div className={`${styles.shimmer} ${styles.boardColumnTitle}`} />
            <div className={`${styles.shimmer} ${styles.boardColumnBadge}`} />
          </div>
          <div className={styles.boardTaskList}>
            {Array.from({ length: column.cards }, (_, cardIndex) => (
              <div key={cardIndex} className={styles.boardTaskCard}>
                <div className={`${styles.shimmer} ${styles.boardTaskTitle}`} />
                <div className={`${styles.shimmer} ${styles.boardTaskDescription}`} />
                <div className={`${styles.shimmer} ${styles.boardTaskMeta}`} />
              </div>
            ))}
            <div className={`${styles.shimmer} ${styles.boardAddTask}`} />
          </div>
        </div>
      ))}
      <div className={styles.boardAddColumn}>
        <div className={`${styles.shimmer} ${styles.boardAddColumnBar}`} />
      </div>
    </div>
  )
}

export function CalendarRouteSkeleton() {
  return (
    <div
      className={styles.calendarSkeleton}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="calendar-route-skeleton"
    >
      <div className={styles.calendarHeader}>
        <div className={styles.calendarNav}>
          <div className={`${styles.shimmer} ${styles.calendarNavBtn}`} />
          <div className={`${styles.shimmer} ${styles.calendarMonthLabel}`} />
          <div className={`${styles.shimmer} ${styles.calendarNavBtn}`} />
        </div>
        <div className={`${styles.shimmer} ${styles.calendarTodayBtn}`} />
      </div>
      <div className={styles.calendarGrid}>
        {Array.from({ length: CALENDAR_SKELETON_WEEKDAYS }, (_, dayIndex) => (
          <div key={dayIndex} className={styles.calendarDayHeader}>
            <div className={`${styles.shimmer} ${styles.calendarDayNameBar}`} />
          </div>
        ))}
        {Array.from({ length: CALENDAR_SKELETON_DAYS }, (_, cellIndex) => {
          const pillCount = CALENDAR_TASK_PILL_COUNTS[cellIndex] ?? 0
          return (
            <div key={cellIndex} className={styles.calendarDayCell}>
              <div className={`${styles.shimmer} ${styles.calendarDayNumber}`} />
              {pillCount > 0 && (
                <div className={styles.calendarCellTasks}>
                  {Array.from({ length: pillCount }, (_, pillIndex) => (
                    <div key={pillIndex} className={`${styles.shimmer} ${styles.calendarTaskPill}`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function RouteContentFallback() {
  const location = useLocation()
  const path = stripLocalePrefix(location.pathname)

  if (path === '/calendar' || path.startsWith('/calendar/')) {
    return <CalendarRouteSkeleton />
  }

  return <BoardRouteSkeleton />
}

export function AppShellRoute() {
  useSyncLocaleRoute()

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.content}>
        <Suspense fallback={<RouteContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
