import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_LOCALE,
  extractPathLocale,
  localizePath,
  resolveInitialLocale,
  resolveSupportedLocale,
  stripLocalePrefix,
  useI18nStore,
} from '@/shared/i18n'

describe('useI18nStore', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
    useI18nStore.getState().setLocale('en')
  })

  describe('initialState', () => {
    it('defines_spanish_as_the_default_root_locale', () => {
      expect(DEFAULT_LOCALE).toBe('es')
    })

    it('has_translations_for_existing_keys', () => {
      expect(useI18nStore.getState().t('app.title')).toBe('Kanban Board')
    })

    it('exposes_available_locales', () => {
      expect(useI18nStore.getState().availableLocales).toEqual(expect.arrayContaining(['en', 'es', 'de']))
    })
  })

  describe('setLocale', () => {
    it('switches_to_spanish_locale_and_translations', () => {
      useI18nStore.getState().setLocale('es')

      const state = useI18nStore.getState()
      expect(state.locale).toBe('es')
      expect(state.t('app.title')).toBe('Tablero Kanban')
    })

    it('falls_back_to_spanish_translations_for_unknown_locale', () => {
      useI18nStore.getState().setLocale('fr')

      const state = useI18nStore.getState()
      expect(state.locale).toBe('fr')
      expect(state.t('app.title')).toBe('Tablero Kanban')
    })
  })

  describe('document language', () => {
    it.each(['es', 'de', 'en'])('switches_the_document_language_to_%s_with_the_locale', (locale) => {
      useI18nStore.getState().setLocale(locale === 'en' ? 'de' : 'en')

      useI18nStore.getState().setLocale(locale)

      expect(document.documentElement.lang).toBe(locale)
    })

    it('reports_spanish_for_a_locale_without_messages', () => {
      useI18nStore.getState().setLocale('fr')

      expect(document.documentElement.lang).toBe('es')
    })

    it('applies_the_persisted_locale_when_the_app_starts', async () => {
      localStorage.setItem('i18n-locale', JSON.stringify({ state: { locale: 'de' }, version: 0 }))
      document.documentElement.lang = 'es'
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.getState().locale).toBe('de')
      expect(document.documentElement.lang).toBe('de')
    })
  })

  describe('first visit and locale resolution', () => {
    beforeEach(() => {
      // The outer setLocale('en') has already stored a locale.
      localStorage.clear()
      window.history.pushState({}, '', '/')
    })

    afterEach(() => {
      vi.restoreAllMocks()
      window.history.pushState({}, '', '/')
    })

    it('finishes_hydration_when_nothing_is_stored', async () => {
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.persist.hasHydrated()).toBe(true)
    })

    it('detects_the_browser_language_when_nothing_is_stored', async () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
      document.documentElement.lang = 'es'
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.getState().locale).toBe('de')
      expect(freshStore.getState().t('app.title')).toBe('Kanban-Board')
      expect(document.documentElement.lang).toBe('de')
    })

    it('falls_back_to_spanish_when_browser_language_is_unsupported', async () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR')
      document.documentElement.lang = 'en'
      vi.resetModules()

      const { useI18nStore: freshStore } = await import('./store')

      expect(freshStore.getState().locale).toBe('es')
      expect(freshStore.getState().t('app.title')).toBe('Tablero Kanban')
      expect(document.documentElement.lang).toBe('es')
    })

    it('resolves_locale_from_prefixed_pathname_over_stored_and_browser_locale', () => {
      expect(
        resolveInitialLocale({
          search: '',
          pathname: '/en/board/main',
          persistedLocale: 'es',
          browserLanguage: 'es-ES',
        }),
      ).toEqual({ locale: 'en', persist: false })

      expect(
        resolveInitialLocale({
          search: '',
          pathname: '/de/calendar/main',
          persistedLocale: 'es',
          browserLanguage: 'es-ES',
        }),
      ).toEqual({ locale: 'de', persist: false })
    })

    it('prioritizes_lang_query_parameter_and_marks_it_for_persistence', () => {
      expect(
        resolveInitialLocale({
          search: '?lang=de',
          pathname: '/en/board/main',
          persistedLocale: 'es',
          browserLanguage: 'es-ES',
        }),
      ).toEqual({ locale: 'de', persist: true })
    })
  })

  describe('localized path helpers', () => {
    it('extracts_prefixed_locales_and_returns_null_for_root_spanish_paths', () => {
      expect(extractPathLocale('/')).toBeNull()
      expect(extractPathLocale('/board/main')).toBeNull()
      expect(extractPathLocale('/en')).toBe('en')
      expect(extractPathLocale('/en/board/main')).toBe('en')
      expect(extractPathLocale('/de/calendar/main')).toBe('de')
      expect(resolveSupportedLocale('ES-es')).toBe('es')
    })

    it('strips_and_localizes_paths_between_root_spanish_and_prefixed_locales', () => {
      expect(stripLocalePrefix('/en')).toBe('/')
      expect(stripLocalePrefix('/en/board/main')).toBe('/board/main')
      expect(stripLocalePrefix('/de/calendar/main')).toBe('/calendar/main')
      expect(localizePath('/board/main', 'es')).toBe('/board/main')
      expect(localizePath('/board/main', 'en')).toBe('/en/board/main')
      expect(localizePath('/en/board/main', 'de')).toBe('/de/board/main')
      expect(localizePath('/de/board/main', 'es')).toBe('/board/main')
      expect(localizePath('/', 'en')).toBe('/en')
      expect(localizePath('/en', 'es')).toBe('/')
    })
  })

  describe('t', () => {
    it('returns_translation_for_existing_key', () => {
      expect(useI18nStore.getState().t('board_view.empty_column')).toBe('No tasks yet')
    })

    it('returns_the_key_when_translation_is_missing', () => {
      expect(useI18nStore.getState().t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('interpolates_parameters_in_translation', () => {
      expect(useI18nStore.getState().t('column.delete', { title: 'My Column' })).toBe('Delete column "My Column"')
    })
  })
})
