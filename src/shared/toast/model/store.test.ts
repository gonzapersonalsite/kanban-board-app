import { beforeEach, describe, expect, it } from 'vitest'
import { useToastStore } from './store'

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ notifications: [] })
  })

  it('adds_a_notification_with_its_type_message_and_its_own_id', () => {
    const { addNotification } = useToastStore.getState()

    addNotification('success', 'Saved')
    addNotification('error', 'Failed')

    const [saved, failed] = useToastStore.getState().notifications
    expect(saved).toMatchObject({ type: 'success', message: 'Saved' })
    expect(failed).toMatchObject({ type: 'error', message: 'Failed' })
    expect(saved.id).not.toBe(failed.id)
  })

  it('keeps_only_the_five_latest_notifications_when_a_sixth_arrives', () => {
    const { addNotification } = useToastStore.getState()

    for (const message of ['1', '2', '3', '4', '5', '6']) addNotification('info', message)

    expect(useToastStore.getState().notifications.map((n) => n.message)).toEqual(['2', '3', '4', '5', '6'])
  })

  it('removes_only_the_notification_with_the_given_id', () => {
    const { addNotification } = useToastStore.getState()
    addNotification('info', 'Keep')
    addNotification('warning', 'Drop')
    const dropped = useToastStore.getState().notifications[1]

    useToastStore.getState().removeNotification(dropped.id)

    expect(useToastStore.getState().notifications.map((n) => n.message)).toEqual(['Keep'])
  })
})
