import type { Task, ColumnId } from '@/shared/api'

export interface CalendarDay {
  year: number
  month: number
  date: number
  dateStr: string
  isCurrentMonth: boolean
}

function dateToStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayStr(): string {
  const now = new Date()
  return dateToStr(now)
}

export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = new Date(year, month, 1).getDay()
  const startOffset = startDow === 0 ? 6 : startDow - 1
  const prevMonthDays = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const date = new Date(year, month - 1, d)
    days.push({ year: date.getFullYear(), month: date.getMonth(), date: d, dateStr: dateToStr(date), isCurrentMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({ year, month, date: d, dateStr: dateToStr(date), isCurrentMonth: true })
  }

  const rem = 7 - (days.length % 7)
  if (rem < 7) {
    for (let d = 1; d <= rem; d++) {
      const date = new Date(year, month + 1, d)
      days.push({ year: date.getFullYear(), month: date.getMonth(), date: d, dateStr: dateToStr(date), isCurrentMonth: false })
    }
  }

  return days
}

export function formatMonthYear(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1))
}

export function getDayNames(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, i + 1)),
  )
}

export type TasksByDate = Map<string, { task: Task; columnId: ColumnId }[]>

export function groupTasksByDate(tasks: Record<ColumnId, Task[]>): TasksByDate {
  const map: TasksByDate = new Map()

  for (const [colId, columnTasks] of Object.entries(tasks)) {
    for (const task of columnTasks) {
      if (!task.dueDate) continue
      const entry = { task, columnId: colId as ColumnId }
      const existing = map.get(task.dueDate)
      if (existing) {
        existing.push(entry)
      } else {
        map.set(task.dueDate, [entry])
      }
    }
  }

  return map
}

export type DueDateStatus = 'overdue' | 'today' | 'upcoming'

export function getDueDateStatus(dueDate: string): DueDateStatus {
  const today = getTodayStr()
  if (dueDate < today) return 'overdue'
  if (dueDate === today) return 'today'
  return 'upcoming'
}
