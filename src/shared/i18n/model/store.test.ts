import { beforeEach, describe, expect, it } from 'vitest'
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
