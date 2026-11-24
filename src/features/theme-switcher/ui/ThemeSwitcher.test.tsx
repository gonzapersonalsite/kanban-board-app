import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import { useThemeStore } from '@/shared/theme'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  afterEach(() => {
    act(() => {
      useI18nStore.getState().setLocale('en')
      useThemeStore.setState({ theme: 'light' })
    })
  })

  it.each([
    ['es', 'Cambiar a modo oscuro'],
    ['en', 'Switch to dark mode'],
    ['de', 'Zum dunklen Modus wechseln'],
  ])('names_the_theme_it_would_switch_to_in_%s', (locale, name) => {
    act(() => {
      useI18nStore.getState().setLocale(locale)
      useThemeStore.setState({ theme: 'light' })
    })

    render(<ThemeSwitcher />)

    expect(screen.getByRole('button', { name })).toBeInTheDocument()
  })

  it('offers_the_light_theme_once_the_dark_one_is_on', () => {
    act(() => {
      useI18nStore.getState().setLocale('es')
      useThemeStore.setState({ theme: 'light' })
    })
    render(<ThemeSwitcher />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))

    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument()
  })
})
