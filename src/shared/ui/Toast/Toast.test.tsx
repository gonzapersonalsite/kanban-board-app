import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import { useToastStore } from '@/shared/toast'
import { Toast } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    useToastStore.setState({ notifications: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
    act(() => useI18nStore.getState().setLocale('en'))
  })

  it('renders_nothing_when_there_are_no_notifications', () => {
    const { container } = render(<Toast />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows_each_notification_as_an_alert_with_its_message', () => {
    act(() => {
      useToastStore.getState().addNotification('success', 'Saved')
      useToastStore.getState().addNotification('error', 'Failed')
    })

    render(<Toast />)

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual(['Saved', 'Failed'])
  })

  it('removes_a_notification_when_its_dismiss_button_is_pressed', () => {
    act(() => useToastStore.getState().addNotification('info', 'Read me'))
    render(<Toast />)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(useToastStore.getState().notifications).toEqual([])
  })

  it('names_its_dismiss_button_in_the_language_of_the_interface', () => {
    act(() => useI18nStore.getState().setLocale('es'))
    act(() => useToastStore.getState().addNotification('info', 'Léeme'))

    render(<Toast />)

    expect(screen.getByRole('button', { name: 'Cerrar notificación' })).toBeInTheDocument()
  })

  it('dismisses_a_notification_by_itself_after_three_and_a_half_seconds', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    act(() => useToastStore.getState().addNotification('info', 'Brief'))
    render(<Toast />)

    act(() => vi.advanceTimersByTime(3499))
    const shownJustBeforeTheDelay = screen.queryByRole('alert') !== null
    act(() => vi.advanceTimersByTime(1))

    expect(shownJustBeforeTheDelay).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
