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
})
