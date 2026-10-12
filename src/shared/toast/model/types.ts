export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
}
