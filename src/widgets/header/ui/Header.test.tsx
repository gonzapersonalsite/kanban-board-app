import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'

describe('Header', () => {
  it('renders_app_title', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(screen.getByText('Kanban Board')).toBeInTheDocument()
  })

  it('renders_nav_links_for_board_and_calendar', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    )

    const boardLink = screen.getByRole('link', { name: /board/i })
    expect(boardLink).toBeInTheDocument()
    expect(boardLink).toHaveAttribute('href', '/')

    const calendarLink = screen.getByRole('link', { name: /calendar/i })
    expect(calendarLink).toBeInTheDocument()
    expect(calendarLink).toHaveAttribute('href', '/calendar')
  })

  it('highlights_board_link_when_on_root_route', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    )

    const boardLink = screen.getByRole('link', { name: /board/i })
    expect(boardLink.getAttribute('aria-current')).toBe('page')
  })

  it('highlights_calendar_link_when_on_calendar_route', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <Header />
      </MemoryRouter>,
    )

    const calendarLink = screen.getByRole('link', { name: /calendar/i })
    expect(calendarLink.getAttribute('aria-current')).toBe('page')
  })
})
