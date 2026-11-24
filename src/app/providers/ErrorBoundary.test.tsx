import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import { ErrorBoundary } from './ErrorBoundary'

const failure = new Error('Internal detail of the failure')

function BrokenScreen(): never {
  throw failure
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    act(() => useI18nStore.getState().setLocale('en'))
  })

  it('renders_its_children_while_nothing_fails', () => {
    render(
      <ErrorBoundary>
        <p>Board</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Board')).toBeInTheDocument()
  })

  it.each([
    ['es', 'Algo ha ido mal', 'Recargar la página'],
    ['en', 'Something went wrong', 'Reload page'],
    ['de', 'Etwas ist schiefgelaufen', 'Seite neu laden'],
  ])('says_what_happened_and_what_to_do_in_%s_when_a_screen_fails', (locale, title, reload) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    act(() => useI18nStore.getState().setLocale(locale))

    render(
      <ErrorBoundary>
        <BrokenScreen />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: reload })).toBeInTheDocument()
  })

  it('sends_the_error_to_the_console_for_whoever_debugs', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <BrokenScreen />
      </ErrorBoundary>,
    )

    expect(consoleError.mock.calls.some(([tag, error]) => tag === '[ErrorBoundary]' && error === failure)).toBe(true)
  })
})
