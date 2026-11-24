import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useI18nStore } from '@/shared/i18n'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
      // Read once and not subscribed: this screen replaces the whole app, language selector included.
      const { t } = useI18nStore.getState()

      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <AlertTriangle className={styles.icon} aria-hidden="true" />
            <h1 className={styles.title}>{t('error.title')}</h1>
            <p className={styles.description}>{t('error.description')}</p>
            <button type="button" className={styles.button} onClick={this.handleReload}>
              {t('error.reload')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
