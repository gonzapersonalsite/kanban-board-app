import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CalendarPage } from './CalendarPage'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'

describe('CalendarPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders_header_and_calendar_grid', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date(2026, 6, 1))
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('July 2026')).toBeInTheDocument()
    expect(screen.getByText('Kanban Board')).toBeInTheDocument()
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
  })
})
