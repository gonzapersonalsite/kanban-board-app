import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AppNotification, NotificationType } from './types'

const MAX_NOTIFICATIONS = 5

interface ToastState {
  notifications: AppNotification[]
  addNotification: (type: NotificationType, message: string) => void
  removeNotification: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  notifications: [],

  addNotification: (type, message) => {
    const id = nanoid()
    set((state) => {
      const trimmed = state.notifications.slice(-(MAX_NOTIFICATIONS - 1))
      return {
        notifications: [...trimmed, { id, type, message }],
      }
    })
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))
