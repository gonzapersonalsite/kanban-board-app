import './styles/global.css'
import { Toast } from '@/shared/ui'
import { ErrorBoundary } from '@/app/providers'
import { AppRouter } from '@/app/router'

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toast />
    </ErrorBoundary>
  )
}
