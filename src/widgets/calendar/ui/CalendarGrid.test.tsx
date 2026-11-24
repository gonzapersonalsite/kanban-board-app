import { act, fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CalendarGrid } from './CalendarGrid'
import { useKanbanStore } from '@/shared/api'
import { useI18nStore } from '@/shared/i18n'
import { COLUMN_TODO_ID } from '@/test/fixtures/kanbanFixtures'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'

function addTasksDueOnTheSameDayAsAlpha(titles: string[]) {
  act(() => {
    titles.forEach((title) => useKanbanStore.getState().addTask(COLUMN_TODO_ID, title, '', '2026-07-15'))
  })
}

describe('CalendarGrid', () => {
  afterEach(() => {
    vi.useRealTimers()
    act(() => useI18nStore.getState().setLocale('en'))
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

  it('holds_its_seven_days_in_a_region_named_by_the_month_that_the_keyboard_reaches', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    const month = screen.getByRole('region', { name: 'July 2026' })
    expect(month).toHaveAttribute('tabindex', '0')
    expect(within(month).getByText('Mon')).toBeInTheDocument()
    expect(within(month).getByText('Sun')).toBeInTheDocument()
  })

  it('describes_each_task_with_the_day_it_is_due', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))

    renderWithKanban(<CalendarGrid />)

    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAccessibleDescription('Wednesday, July 15')
  })

  it('describes_the_count_of_the_tasks_that_do_not_fit_with_their_day', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))
    renderWithKanban(<CalendarGrid />)

    addTasksDueOnTheSameDayAsAlpha(['Delta', 'Epsilon'])

    expect(screen.getByRole('button', { name: '+1 more' })).toHaveAccessibleDescription('Wednesday, July 15')
  })

  it('names_the_dialog_of_a_day_and_its_close_button_in_the_language_of_the_interface', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))
    act(() => useI18nStore.getState().setLocale('es'))
    renderWithKanban(<CalendarGrid />)
    addTasksDueOnTheSameDayAsAlpha(['Delta', 'Epsilon'])

    fireEvent.click(screen.getByRole('button', { name: '+1 más' }))

    const dayDialog = screen.getByRole('dialog', { name: 'miércoles, 15 de julio' })
    expect(within(dayDialog).getByRole('button', { name: 'Cerrar ventana' })).toBeInTheDocument()
    expect(within(dayDialog).getByRole('button', { name: 'Epsilon' })).toBeInTheDocument()
  })
})
