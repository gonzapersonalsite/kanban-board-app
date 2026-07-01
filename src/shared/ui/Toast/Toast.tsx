import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore } from './model/toastStore'
import { IconButton } from '../IconButton'
import type { AppNotification } from './model/types'
import styles from './Toast.module.css'

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const

const DISMISS_DELAY = 3500

function ToastItem({
  notification,
  onDismiss,
}: {
  notification: AppNotification
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, DISMISS_DELAY)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const Icon = ICON_MAP[notification.type]

  return (
    <div className={`${styles.item} ${styles[notification.type]}`} role="alert">
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{notification.message}</span>
      <IconButton
        icon={<X size={14} />}
        label="Dismiss notification"
        onClick={onDismiss}
        className={styles.dismiss}
      />
    </div>
  )
}

export function Toast() {
  const notifications = useToastStore((s) => s.notifications)
  const removeNotification = useToastStore((s) => s.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className={styles.container} aria-live="polite">
      {notifications.map((n) => (
        <ToastItem
          key={n.id}
          notification={n}
          onDismiss={() => removeNotification(n.id)}
        />
      ))}
    </div>
  )
}
