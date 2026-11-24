import { useId, useMemo, useState } from 'react'
import { useKanbanStore } from '@/shared/api'
import { selectActiveBoardTasks } from '@/entities/board'
import { useTranslation } from '@/shared/i18n'
import { Dialog } from '@/shared/ui'
import type { Task, ColumnId } from '@/shared/api'
import { useCalendar } from '../model/useCalendar'
import {
  getMonthGrid,
  formatDayLabel,
  formatMonthYear,
  getDayNames,
  groupTasksByDate,
  getTodayStr,
  getDueDateStatus,
} from '../lib/calendarUtils'
import styles from './CalendarGrid.module.css'

interface CalendarGridProps {
  onTaskClick?: (task: Task, columnId: ColumnId) => void
}

export function CalendarGrid({ onTaskClick }: CalendarGridProps) {
  const { t, locale } = useTranslation()
  const { year, month, goNext, goPrev, goToday } = useCalendar()
  const tasks = useKanbanStore(selectActiveBoardTasks)
  const MAX_VISIBLE = 2
  const monthLabelId = useId()
  const dayLabelIdPrefix = useId()

  const [dayOverflow, setDayOverflow] = useState<{
    dateStr: string
    entries: { task: Task; columnId: ColumnId }[]
  } | null>(null)

  const days = useMemo(() => getMonthGrid(year, month), [year, month])
  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks])
  const dayNames = useMemo(() => getDayNames(locale), [locale])
  const monthLabel = useMemo(() => formatMonthYear(year, month, locale), [year, month, locale])
  const todayStr = useMemo(() => getTodayStr(), [])

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} onClick={goPrev} aria-label={t('calendar.prev_month')}>
            ‹
          </button>
          <h2 id={monthLabelId} className={styles.monthLabel}>
            {monthLabel}
          </h2>
          <button type="button" className={styles.navBtn} onClick={goNext} aria-label={t('calendar.next_month')}>
            ›
          </button>
        </div>
        <button type="button" className={styles.todayBtn} onClick={goToday}>
          {t('calendar.today')}
        </button>
      </div>

      {/* The month scrolls sideways inside this box when its seven days do not fit, and the keyboard
          reaches that scroll here: #calendar-loses-a-day-column-on-a-narrow-screen-with-large-text */}
      <div className={styles.gridViewport} role="region" aria-labelledby={monthLabelId} tabIndex={0}>
        <div className={styles.grid}>
          {dayNames.map((name) => (
            <div key={name} className={styles.dayName}>
              {name}
            </div>
          ))}

          {days.map((day) => {
            const entries = tasksByDate.get(day.dateStr)
            const isToday = day.dateStr === todayStr
            const dayLabelId = `${dayLabelIdPrefix}-${day.dateStr}`

            const cellClass = [
              styles.dayCell,
              !day.isCurrentMonth ? styles.otherMonth : '',
              isToday ? styles.today : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={day.dateStr} className={cellClass}>
                <span className={styles.dayNumber}>{day.date}</span>
                {entries && entries.length > 0 && (
                  <div className={styles.taskList}>
                    <span id={dayLabelId} hidden>
                      {formatDayLabel(day.dateStr, locale)}
                    </span>
                    {entries.slice(0, MAX_VISIBLE).map(({ task, columnId }) => {
                      const status = getDueDateStatus(task.dueDate!)
                      return (
                        <button
                          key={task.id}
                          type="button"
                          className={`${styles.taskLabel} ${status === 'today' ? styles.todayState : styles[status]}`}
                          onClick={() => onTaskClick?.(task, columnId)}
                          title={task.title}
                          aria-describedby={dayLabelId}
                        >
                          {task.title}
                        </button>
                      )
                    })}
                    {entries.length > MAX_VISIBLE && (
                      <button
                        type="button"
                        className={styles.moreBtn}
                        onClick={() => setDayOverflow({ dateStr: day.dateStr, entries })}
                        aria-describedby={dayLabelId}
                      >
                        +{entries.length - MAX_VISIBLE} {t('calendar.more')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {dayOverflow && (
        <Dialog
          open={true}
          onClose={() => setDayOverflow(null)}
          title={formatDayLabel(dayOverflow.dateStr, locale)}
          closeLabel={t('dialog.close')}
        >
          <div className={styles.dayOverflowList}>
            {dayOverflow.entries.map(({ task, columnId }) => {
              const status = getDueDateStatus(task.dueDate!)
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`${styles.dayOverflowItem} ${status === 'today' ? styles.todayState : styles[status]}`}
                  onClick={() => {
                    onTaskClick?.(task, columnId)
                    setDayOverflow(null)
                  }}
                >
                  {task.title}
                </button>
              )
            })}
          </div>
        </Dialog>
      )}
    </div>
  )
}
