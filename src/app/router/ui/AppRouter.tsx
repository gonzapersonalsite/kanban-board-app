import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom'
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

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    element: (
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/calendar',
    errorElement: <RouteErrorBoundary />,
    element: (
      <Suspense fallback={null}>
        <CalendarPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    errorElement: <RouteErrorBoundary />,
    element: (
      <Suspense fallback={null}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
