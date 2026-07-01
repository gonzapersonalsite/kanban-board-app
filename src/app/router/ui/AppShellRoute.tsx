import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/header'
import styles from './AppShellRoute.module.css'

export function RouteContentFallback() {
  return (
    <div className={styles.fallback} role="status" aria-live="polite">
      <div className={styles.fallbackCard}>
        <div className={styles.fallbackLinePrimary} />
        <div className={styles.fallbackLineSecondary} />
        <div className={styles.fallbackLineTertiary} />
      </div>
    </div>
  )
}

export function AppShellRoute() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.content}>
        <Suspense fallback={<RouteContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
