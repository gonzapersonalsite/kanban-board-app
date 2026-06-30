import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Locale, TranslationMap } from './types'
import { flattenTranslations, interpolate } from '../lib/translations'

const localeModules = import.meta.glob<Record<string, unknown>>(
  '../config/*.json',
  { eager: true, import: 'default' },
)

function extractLocale(filePath: string): Locale {
  const match = filePath.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\.json$/)
  return match ? match[1] : 'en'
}

function loadAllTranslations(): Record<Locale, TranslationMap> {
  const result: Record<Locale, TranslationMap> = {}

  for (const [path, data] of Object.entries(localeModules)) {
    const locale = extractLocale(path)
    result[locale] = flattenTranslations(data)
  }

  return result
}

const allTranslations = loadAllTranslations()
const DEFAULT_LOCALE: Locale = 'en'

function detectBrowserLocale(): Locale {
  const navLang = navigator.language?.split('-')[0] ?? ''
  if (allTranslations[navLang]) return navLang
  return DEFAULT_LOCALE
}

interface I18nStore {
  locale: Locale
  translations: TranslationMap
  availableLocales: Locale[]
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      translations: allTranslations[DEFAULT_LOCALE],
      availableLocales: Object.keys(allTranslations),

      setLocale: (locale: Locale) => {
        const translations =
          allTranslations[locale] ?? allTranslations[DEFAULT_LOCALE]
        set({ locale, translations })
      },

      t: (key: string, params?: Record<string, string | number>) => {
        const { translations } = get()
        const template = translations[key]
        if (template === undefined) return key
        return interpolate(template, params)
      },
    }),
    {
      name: 'i18n-locale',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locale: state.locale }),
      merge: (persisted, current) => {
        const locale =
          (persisted as { locale: Locale }).locale ?? current.locale
        return {
          ...current,
          locale,
          translations:
            allTranslations[locale] ?? allTranslations[DEFAULT_LOCALE],
        }
      },
    },
  ),
)

const stored = localStorage.getItem('i18n-locale')
if (!stored) {
  const browserLocale = detectBrowserLocale()
  if (browserLocale !== DEFAULT_LOCALE) {
    useI18nStore.getState().setLocale(browserLocale)
  }
}
