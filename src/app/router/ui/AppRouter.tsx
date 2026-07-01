import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useRouteError } from 'react-router-dom'
import { useKanbanStore } from '@/shared/api'
import { buildBoardPath, resolveFallbackBoardId, type BoardViewRoute } from '@/entities/board'
import { useSyncBoardRoute } from '../model/useSyncBoardRoute'
import { AppShellRoute, RouteContentFallback } from './AppShellRoute'
import styles from './RouteErrorBoundary.module.css'

const HomePage = lazy(() =>
  import('@/pages/home').then((m) => ({ default: m.HomePage })),
)
const CalendarPage = lazy(() =>
  import('@/pages/calendar').then((m) => ({ default: m.CalendarPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
)

function RouteErrorBoundary() {
  const error = useRouteError()

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Something went wrong</h1>
      <p className={styles.message}>{error instanceof Error ? error.message : 'Unexpected error'}</p>
      <button className={styles.reloadButton} onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  )
}

function ActiveBoardRedirect({ view }: { view: BoardViewRoute }) {
  const boards = useKanbanStore((state) => state.boards)
  const activeBoardId = useKanbanStore((state) => state.activeBoardId)
  const targetBoardId = resolveFallbackBoardId(boards, activeBoardId)

  if (!targetBoardId) {
    return null
  }

  return <Navigate to={buildBoardPath(view, targetBoardId)} replace />
}

function BoardPageRoute() {
  const isReady = useSyncBoardRoute('board')

  if (!isReady) {
    return <RouteContentFallback />
  }

  return <HomePage />
}

function CalendarPageRoute() {
  const isReady = useSyncBoardRoute('calendar')

  if (!isReady) {
    return <RouteContentFallback />
  }

  return <CalendarPage />
}

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    element: <AppShellRoute />,
    children: [
      {
        index: true,
        element: <ActiveBoardRedirect view="board" />,
      },
      {
        path: 'board/:boardId',
        element: <BoardPageRoute />,
      },
      {
        path: 'calendar',
        element: <ActiveBoardRedirect view="calendar" />,
      },
      {
        path: 'calendar/:boardId',
        element: <CalendarPageRoute />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
