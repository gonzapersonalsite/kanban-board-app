import { screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CalendarGrid } from './CalendarGrid'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'

describe('CalendarGrid', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders_month_header_with_nav_buttons', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    expect(screen.getByText('July 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
  })

  it('renders_7_day_name_headers_starting_with_Mon', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders_day_numbers_from_1_to_31_for_july_2026', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('shows_task_label_for_task_with_dueDate_in_current_month', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    const labels = document.querySelectorAll('button[class*="taskLabel"]')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('calls_onTaskClick_when_task_label_is_clicked', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    const handleClick = vi.fn()
    renderWithKanban(<CalendarGrid onTaskClick={handleClick} />)

    const labels = document.querySelectorAll('button[class*="taskLabel"]')
    expect(labels.length).toBeGreaterThan(0)

    ;(labels[0] as HTMLElement).click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
