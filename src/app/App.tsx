import './styles/global.css'
import { HomePage } from '@/pages/home'
import { Toast } from '@/shared/ui'
import { ErrorBoundary } from '@/app/providers'

export default function App() {
  return (
    <ErrorBoundary>
      <HomePage />
      <Toast />
    </ErrorBoundary>
  )
}
