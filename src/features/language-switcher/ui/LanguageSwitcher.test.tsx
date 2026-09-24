import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  afterEach(() => {
    act(() => useI18nStore.getState().setLocale('en'))
  })

  it('names_the_select_with_the_language_label_of_the_current_locale', () => {
    act(() => useI18nStore.getState().setLocale('es'))

    render(<LanguageSwitcher />)

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es')
  })

  it('switches_the_locale_and_its_own_name_when_another_language_is_chosen', () => {
    render(<LanguageSwitcher />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'de' },
    })

    expect(useI18nStore.getState().locale).toBe('de')
    expect(screen.getByRole('combobox', { name: 'Sprache' })).toHaveValue('de')
  })
})
