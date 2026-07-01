import { describe, expect, it } from 'vitest'
import {
  getMonthGrid,
  groupTasksByDate,
  getDueDateStatus,
  getTodayStr,
  getDayNames,
  formatMonthYear,
} from './calendarUtils'
import type { ColumnId, Task } from '@/shared/api'

describe('calendarUtils', () => {
  describe('getMonthGrid', () => {
    it('returns_42_days_for_6_week_month', () => {
      const days = getMonthGrid(2026, 2)
      expect(days).toHaveLength(42)
    })

    it('returns_35_days_for_5_week_month', () => {
      const days = getMonthGrid(2026, 1)
      expect(days).toHaveLength(35)
    })

    it('first_day_is_monday', () => {
      const days = getMonthGrid(2026, 6)
      const firstDate = new Date(days[0].dateStr)
      expect(firstDate.getDay()).toBe(1)
    })

    it('marks_correct_days_as_current_month', () => {
      const days = getMonthGrid(2026, 0)
      const currentMonthDays = days.filter((d) => d.isCurrentMonth)
      expect(currentMonthDays).toHaveLength(31)
    })

    it('provides_dateStr_in_YYYY_MM_DD_format', () => {
      const days = getMonthGrid(2026, 0)
      const currentMonthDays = days.filter((d) => d.isCurrentMonth)
      expect(currentMonthDays[0].dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('getTodayStr', () => {
    it('returns_today_as_YYYY_MM_DD', () => {
      const today = getTodayStr()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('matches_current_date', () => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      expect(getTodayStr()).toBe(`${y}-${m}-${d}`)
    })
  })

  describe('getDueDateStatus', () => {
    it('returns_overdue_for_past_date', () => {
      expect(getDueDateStatus('2020-01-01')).toBe('overdue')
    })

    it('returns_today_for_current_date', () => {
      expect(getDueDateStatus(getTodayStr())).toBe('today')
    })

    it('returns_upcoming_for_future_date', () => {
      expect(getDueDateStatus('2099-12-31')).toBe('upcoming')
    })
  })

  describe('groupTasksByDate', () => {
    const COL_A = 'col-1'
    const COL_B = 'col-2'

    it('groups_tasks_by_dueDate', () => {
      const tasks: Record<string, Task[]> = {
        [COL_A]: [
          { id: 'a', title: 'A', description: '', dueDate: '2026-07-15' },
          { id: 'b', title: 'B', description: '', dueDate: '2026-07-20' },
        ],
        [COL_B]: [
          { id: 'c', title: 'C', description: '', dueDate: '2026-07-15' },
        ],
      }

      const grouped = groupTasksByDate(tasks as Record<ColumnId, Task[]>)

      expect(grouped.get('2026-07-15')).toHaveLength(2)
      expect(grouped.get('2026-07-20')).toHaveLength(1)
    })

    it('skips_tasks_without_dueDate', () => {
      const tasks: Record<string, Task[]> = {
        [COL_A]: [
          { id: 'a', title: 'A', description: '' },
          { id: 'b', title: 'B', description: '', dueDate: '2026-07-20' },
        ],
      }

      const grouped = groupTasksByDate(tasks as Record<ColumnId, Task[]>)
      expect(grouped.size).toBe(1)
    })
  })

  describe('getDayNames', () => {
    it('returns_7_day_names', () => {
      expect(getDayNames('en')).toHaveLength(7)
    })

    it('starts_with_monday', () => {
      const names = getDayNames('en')
      expect(names[0].toLowerCase()).toMatch(/^mon/)
    })

    it('returns_spanish_day_names_for_es_locale', () => {
      const names = getDayNames('es')
      expect(names[0]).toMatch(/^lun/i)
    })
  })

  describe('formatMonthYear', () => {
    it('returns_formatted_month_and_year', () => {
      const result = formatMonthYear(2026, 6, 'en')
      expect(result).toBe('July 2026')
    })

    it('uses_spanish_locale', () => {
      const result = formatMonthYear(2026, 0, 'es')
      expect(result).toMatch(/enero.*2026/)
    })
  })
})
