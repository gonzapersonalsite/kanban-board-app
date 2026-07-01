import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <AlertTriangle size={40} className={styles.icon} aria-hidden="true" />
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.description}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              type="button"
              className={styles.button}
              onClick={this.handleReload}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
