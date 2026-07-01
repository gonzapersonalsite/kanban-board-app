import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'
import { useSyncBoardRoute } from './useSyncBoardRoute'

function RouteSyncProbe({ view }: { view: 'board' | 'calendar' }) {
  const isReady = useSyncBoardRoute(view)
  const location = useLocation()

  return <div>{`${isReady}:${location.pathname}`}</div>
}

describe('useSyncBoardRoute', () => {
  it('redirects_to_the_restored_active_board_when_the_current_route_becomes_invalid', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Routes>
          <Route
            path="/board/:boardId"
            element={<RouteSyncProbe view="board" />}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(`true:/board/${BOARD_MAIN_ID}`)).toBeInTheDocument()

    act(() => {
      useKanbanStore.setState({
        boards: [{ id: 'board-restored', title: 'Restored Board' }],
        activeBoardId: 'board-restored',
        columnsByBoard: {
          'board-restored': [{ id: 'col-restored', title: 'Restored Column' }],
        },
        tasksByBoard: {
          'board-restored': {
            'col-restored': [],
          },
        },
      })
    })

    await waitFor(() => {
      expect(screen.getByText('true:/board/board-restored')).toBeInTheDocument()
    })
  })
})
