import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from './NotFoundPage'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'

function LocationDisplay() {
  const location = useLocation()

  return <div>{location.pathname}</div>
}

describe('NotFoundPage', () => {
  it('navigates_to_a_valid_board_route_from_the_action_button', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={['/missing']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <NotFoundPage />
                <LocationDisplay />
              </>
            }
          />
          <Route path="/board/:boardId" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /back to home/i }))

    expect(screen.getByText(`/board/${BOARD_MAIN_ID}`)).toBeInTheDocument()
  })

  it('navigates_to_the_active_board_calendar_route_from_the_secondary_action_button', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={['/en/missing']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <NotFoundPage />
                <LocationDisplay />
              </>
            }
          />
          <Route path="/en/calendar/:boardId" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    const metaBeforeNavigation = document.querySelector('meta[name="robots"]')?.getAttribute('content')

    fireEvent.click(screen.getByRole('button', { name: /open calendar/i }))

    expect(metaBeforeNavigation).toBe('noindex')
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
    expect(screen.getByText(`/en/calendar/${BOARD_MAIN_ID}`)).toBeInTheDocument()
  })

  it('navigates_when_dragging_and_dropping_a_recovery_card_into_the_done_column', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <NotFoundPage />
                <LocationDisplay />
              </>
            }
          />
          <Route path="/calendar/:boardId" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )
    const calendarCard = screen.getByTestId('recovery-card-calendar')
    const doneColumn = screen.getByTestId('not-found-done-column')

    fireEvent.dragStart(calendarCard)
    fireEvent.dragOver(doneColumn)
    fireEvent.drop(doneColumn)

    expect(screen.getByText(`/calendar/${BOARD_MAIN_ID}`)).toBeInTheDocument()
  })
})
