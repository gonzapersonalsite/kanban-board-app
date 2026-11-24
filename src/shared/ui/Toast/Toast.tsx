import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { useToastStore, type AppNotification } from '@/shared/toast'
import { IconButton } from '../IconButton'
import styles from './Toast.module.css'

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const

const DISMISS_DELAY = 3500

interface ToastItemProps {
  notification: AppNotification
  dismissLabel: string
  onDismiss: () => void
}

function ToastItem({ notification, dismissLabel, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, DISMISS_DELAY)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const Icon = ICON_MAP[notification.type]

  return (
    <div className={`${styles.item} ${styles[notification.type]}`} role="alert">
      <Icon className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{notification.message}</span>
      <IconButton icon={<X />} label={dismissLabel} onClick={onDismiss} className={styles.dismiss} />
    </div>
  )
}

export function Toast() {
  const { t } = useTranslation()
  const notifications = useToastStore((s) => s.notifications)
  const removeNotification = useToastStore((s) => s.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className={styles.container} aria-live="polite">
      {notifications.map((n) => (
        <ToastItem
          key={n.id}
          notification={n}
          dismissLabel={t('toast.dismiss')}
          onDismiss={() => removeNotification(n.id)}
        />
      ))}
    </div>
  )
}
