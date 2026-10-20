import { Suspense, lazy, useEffect, type ComponentType } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation, useRouteError } from 'react-router-dom'
import { useKanbanStore } from '@/shared/api'
import { PREFIXED_LOCALES, extractPathLocale, resolveSupportedLocale, useI18nStore } from '@/shared/i18n'
import { buildBoardPath, resolveFallbackBoardId, type BoardViewRoute } from '@/entities/board'
import { useSyncBoardRoute } from '../model/useSyncBoardRoute'
import { AppShellRoute, BoardRouteSkeleton, CalendarRouteSkeleton } from './AppShellRoute'
import styles from './RouteErrorBoundary.module.css'

type PageModule = { default: ComponentType }
type PageId = 'board' | 'calendar' | 'notFound'

// Each page chunk is loaded from one place: React.lazy renders it and the idle prefetch warms it.
const PAGE_LOADERS: Record<PageId, () => Promise<PageModule>> = {
  board: () => import('@/pages/home').then((m) => ({ default: m.HomePage })),
  calendar: () => import('@/pages/calendar').then((m) => ({ default: m.CalendarPage })),
  notFound: () => import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
}

const HomePage = lazy(PAGE_LOADERS.board)
const CalendarPage = lazy(PAGE_LOADERS.calendar)
const NotFoundPage = lazy(PAGE_LOADERS.notFound)

function usePrefetchPages() {
  useEffect(() => {
    let cancelled = false
    const run = () => {
      if (cancelled) {
        return
      }
      ;(Object.entries(PAGE_LOADERS) as [PageId, () => Promise<PageModule>][]).forEach(([page, load]) => {
        void load().catch((error: unknown) => {
          console.warn({ event: 'page-prefetch-failed', page, error })
        })
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 4000 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }

    const timer = window.setTimeout(run, 2000)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])
}

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
  const location = useLocation()
  const locale = useI18nStore((state) => state.locale)
  const boards = useKanbanStore((state) => state.boards)
  const activeBoardId = useKanbanStore((state) => state.activeBoardId)
  const targetBoardId = resolveFallbackBoardId(boards, activeBoardId)

  if (!targetBoardId) {
    return view === 'calendar' ? <CalendarRouteSkeleton /> : <BoardRouteSkeleton />
  }

  const queryLocale = resolveSupportedLocale(new URLSearchParams(location.search).get('lang'))
  const targetLocale = queryLocale ?? extractPathLocale(location.pathname) ?? locale

  return <Navigate to={buildBoardPath(view, targetBoardId, targetLocale)} replace />
}

function BoardPageRoute() {
  const isReady = useSyncBoardRoute('board')

  if (!isReady) {
    return <BoardRouteSkeleton />
  }

  return (
    <Suspense fallback={<BoardRouteSkeleton />}>
      <HomePage />
    </Suspense>
  )
}

function CalendarPageRoute() {
  const isReady = useSyncBoardRoute('calendar')

  if (!isReady) {
    return <CalendarRouteSkeleton />
  }

  return (
    <Suspense fallback={<CalendarRouteSkeleton />}>
      <CalendarPage />
    </Suspense>
  )
}

const boardRoutes = [
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
]

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    element: <AppShellRoute />,
    children: [
      ...boardRoutes,
      ...PREFIXED_LOCALES.map((locale) => ({
        path: locale,
        children: boardRoutes,
      })),
    ],
  },
])

export function AppRouter() {
  usePrefetchPages()

  return <RouterProvider router={router} />
}
