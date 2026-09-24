import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useI18nStore } from '@/shared/i18n'

describe('useI18nStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useI18nStore.getState().setLocale('en')
  })

  describe('initialState', () => {
    it('starts_with_english_locale', () => {
      expect(useI18nStore.getState().locale).toBe('en')
    })

    it('has_translations_for_existing_keys', () => {
      expect(useI18nStore.getState().t('app.title')).toBe('Kanban Board')
    })

    it('exposes_available_locales', () => {
      expect(useI18nStore.getState().availableLocales).toEqual(
        expect.arrayContaining(['en', 'es']),
      )
    })
  })

  describe('setLocale', () => {
    it('switches_to_spanish_locale_and_translations', () => {
      useI18nStore.getState().setLocale('es')

      const state = useI18nStore.getState()
      expect(state.locale).toBe('es')
      expect(state.t('app.title')).toBe('Tablero Kanban')
    })

    it('falls_back_to_english_translations_for_unknown_locale', () => {
      useI18nStore.getState().setLocale('fr')

      const state = useI18nStore.getState()
      expect(state.locale).toBe('fr')
      expect(state.t('app.title')).toBe('Kanban Board')
    })
  })

  describe('document language', () => {
    it.each(['es', 'de', 'en'])('switches_the_document_language_to_%s_with_the_locale', (locale) => {
      useI18nStore.getState().setLocale(locale === 'en' ? 'de' : 'en')

      useI18nStore.getState().setLocale(locale)

      expect(document.documentElement.lang).toBe(locale)
    })

    it('reports_english_for_a_locale_without_messages', () => {
      useI18nStore.getState().setLocale('fr')

      expect(document.documentElement.lang).toBe('en')
    })

    it('applies_the_persisted_locale_when_the_app_starts', async () => {
      localStorage.setItem('i18n-locale', JSON.stringify({ state: { locale: 'de' }, version: 0 }))
      document.documentElement.lang = 'en'
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.getState().locale).toBe('de')
      expect(document.documentElement.lang).toBe('de')
    })
  })

  describe('first visit', () => {
    beforeEach(() => {
      // The outer setLocale('en') has already stored a locale.
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('finishes_hydration_when_nothing_is_stored', async () => {
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.persist.hasHydrated()).toBe(true)
    })

    it('detects_the_browser_language_when_nothing_is_stored', async () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
      document.documentElement.lang = 'en'
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.getState().locale).toBe('de')
      expect(freshStore.getState().t('app.title')).toBe('Kanban-Board')
      expect(document.documentElement.lang).toBe('de')
    })
  })

  describe('t', () => {
    it('returns_translation_for_existing_key', () => {
      expect(useI18nStore.getState().t('board_view.empty_column')).toBe(
        'No tasks yet',
      )
    })

    it('returns_the_key_when_translation_is_missing', () => {
      expect(useI18nStore.getState().t('nonexistent.key')).toBe(
        'nonexistent.key',
      )
    })

    it('interpolates_parameters_in_translation', () => {
      expect(
        useI18nStore.getState().t('column.delete', { title: 'My Column' }),
      ).toBe('Delete column "My Column"')
    })
  })
})
