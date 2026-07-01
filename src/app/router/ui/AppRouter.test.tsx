import { render, screen, waitFor } from '@testing-library/react'
import { useLocation, useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DragOverlay: () => null,
  useDroppable: () => ({ ref: () => undefined, isDropTarget: false }),
  useDragOperation: () => ({ source: null, target: null }),
  PointerSensor: {
    configure: () => 'PointerSensor',
  },
  KeyboardSensor: 'KeyboardSensor',
}))

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: () => ({
    ref: () => undefined,
    isDragging: false,
    isDropTarget: false,
  }),
}))

vi.mock('@/pages/home', () => ({
  HomePage: () => {
    const location = useLocation()
    const params = useParams()

    return <div>{`Home Page:${location.pathname}:${params.boardId ?? ''}`}</div>
  },
}))

vi.mock('@/pages/calendar', () => ({
  CalendarPage: () => {
    const location = useLocation()
    const params = useParams()

    return <div>{`Calendar Page:${location.pathname}:${params.boardId ?? ''}`}</div>
  },
}))

vi.mock('@/pages/not-found', () => ({
  NotFoundPage: () => <div>Not Found Page</div>,
}))

describe('AppRouter', () => {
  it('redirects_root_to_the_active_board_route', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    window.history.pushState({}, '', '/')
    vi.resetModules()
    const { AppRouter } = await import('./AppRouter')

    render(<AppRouter />)

    await waitFor(() => {
      expect(
        screen.getByText(`Home Page:/board/${BOARD_MAIN_ID}:${BOARD_MAIN_ID}`),
      ).toBeInTheDocument()
    })
  })

  it('redirects_calendar_root_to_the_active_board_calendar_route', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    window.history.pushState({}, '', '/calendar')
    vi.resetModules()
    const { AppRouter } = await import('./AppRouter')

    render(<AppRouter />)

    await waitFor(() => {
      expect(
        screen.getByText(`Calendar Page:/calendar/${BOARD_MAIN_ID}:${BOARD_MAIN_ID}`),
      ).toBeInTheDocument()
    })
  })

  it('syncs_store_with_a_valid_board_route', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useKanbanStore.getState().addBoard('Secondary')
    const secondaryBoardId = useKanbanStore
      .getState()
      .boards.find((board) => board.title === 'Secondary')!.id
    useKanbanStore.getState().setActiveBoard(BOARD_MAIN_ID)
    window.history.pushState({}, '', `/board/${secondaryBoardId}`)
    vi.resetModules()
    const { AppRouter } = await import('./AppRouter')

    render(<AppRouter />)

    await waitFor(() => {
      expect(
        screen.getByText(`Home Page:/board/${secondaryBoardId}:${secondaryBoardId}`),
      ).toBeInTheDocument()
    })
  })

  it('redirects_an_invalid_board_route_to_a_valid_fallback', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    window.history.pushState({}, '', '/board/missing-board')
    vi.resetModules()
    const { AppRouter } = await import('./AppRouter')

    render(<AppRouter />)

    await waitFor(() => {
      expect(
        screen.getByText(`Home Page:/board/${BOARD_MAIN_ID}:${BOARD_MAIN_ID}`),
      ).toBeInTheDocument()
    })
  })
})
