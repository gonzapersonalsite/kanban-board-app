import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Locale, TranslationMap } from './types'
import { flattenTranslations, interpolate } from '../lib/translations'
import { localeModules } from '../config/locales'

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
export const DEFAULT_LOCALE: Locale = 'es'
export const PREFIXED_LOCALES: readonly Locale[] = Object.keys(allTranslations).filter(
  (locale) => locale !== DEFAULT_LOCALE,
)

const OG_LOCALE_BY_LOCALE: Record<Locale, string> = {
  es: 'es_ES',
  en: 'en_US',
  de: 'de_DE',
}

export function resolveSupportedLocale(value: string | null | undefined): Locale | null {
  const code = value?.trim().toLowerCase().split('-')[0] ?? ''
  return allTranslations[code] ? code : null
}

export function extractPathLocale(pathname: string): Locale | null {
  const [, firstSegment = ''] = pathname.split('/')
  const normalized = firstSegment.toLowerCase()
  return PREFIXED_LOCALES.includes(normalized) ? normalized : null
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  const pathLocale = extractPathLocale(normalizedPath)
  if (!pathLocale) {
    return normalizedPath
  }
  const stripped = normalizedPath.slice(pathLocale.length + 1)
  return stripped.startsWith('/') ? stripped : stripped ? `/${stripped}` : '/'
}

export function localizePath(pathname: string, locale: Locale = DEFAULT_LOCALE): string {
  const basePath = stripLocalePrefix(pathname)
  const resolvedLocale = resolveSupportedLocale(locale) ?? DEFAULT_LOCALE
  if (resolvedLocale === DEFAULT_LOCALE) {
    return basePath
  }
  return basePath === '/' ? `/${resolvedLocale}` : `/${resolvedLocale}${basePath}`
}

function readPersistedLocale(): Locale | null {
  try {
    const raw = localStorage.getItem('i18n-locale')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { locale?: string } }
    return resolveSupportedLocale(parsed?.state?.locale)
  } catch {
    return null
  }
}

export interface InitialLocaleResolution {
  locale: Locale
  persist: boolean
}

export function resolveInitialLocale(
  options: {
    search?: string
    pathname?: string
    persistedLocale?: string | null
    browserLanguage?: string
  } = {},
): InitialLocaleResolution {
  const search = options.search ?? window.location.search
  const pathname = options.pathname ?? window.location.pathname
  const persistedLocale =
    options.persistedLocale !== undefined ? resolveSupportedLocale(options.persistedLocale) : readPersistedLocale()
  const browserLanguage = options.browserLanguage ?? navigator.language

  const queryLocale = resolveSupportedLocale(new URLSearchParams(search).get('lang'))
  if (queryLocale) {
    return { locale: queryLocale, persist: true }
  }

  const pathLocale = extractPathLocale(pathname)
  if (pathLocale) {
    return { locale: pathLocale, persist: false }
  }

  if (persistedLocale) {
    return { locale: persistedLocale, persist: false }
  }

  return {
    locale: resolveSupportedLocale(browserLanguage) ?? DEFAULT_LOCALE,
    persist: false,
  }
}

const initialResolution = resolveInitialLocale()

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
      locale: initialResolution.locale,
      translations: allTranslations[initialResolution.locale] ?? allTranslations[DEFAULT_LOCALE],
      availableLocales: Object.keys(allTranslations),

      setLocale: (locale: Locale) => {
        const translations = allTranslations[locale] ?? allTranslations[DEFAULT_LOCALE]
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
      // zustand calls merge with undefined when nothing is stored yet (a first visit).
      merge: (persisted, current) => {
        const persistedLocale = (persisted as { locale?: Locale } | undefined)?.locale ?? null
        const resolved = resolveInitialLocale({ persistedLocale })
        return {
          ...current,
          locale: resolved.locale,
          translations: allTranslations[resolved.locale] ?? allTranslations[DEFAULT_LOCALE],
        }
      },
    },
  ),
)

if (initialResolution.persist) {
  useI18nStore.getState().setLocale(initialResolution.locale)
}

// Screen readers choose pronunciation rules from the document language, so it must follow
// the locale on screen. A locale without messages renders Spanish, so it reports Spanish.
function applyDocumentLanguage(locale: Locale): void {
  const effectiveLocale = allTranslations[locale] ? locale : DEFAULT_LOCALE
  document.documentElement.lang = effectiveLocale
  const ogLocaleMeta = document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')
  if (ogLocaleMeta) {
    ogLocaleMeta.setAttribute('content', OG_LOCALE_BY_LOCALE[effectiveLocale] ?? OG_LOCALE_BY_LOCALE[DEFAULT_LOCALE])
  }
  const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const currentHref = canonicalLink?.getAttribute('href')
  if (canonicalLink && currentHref) {
    try {
      const nextUrl = new URL(localizePath(window.location.pathname, effectiveLocale), currentHref).toString()
      canonicalLink.setAttribute('href', nextUrl)
      const ogUrlMeta = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
      if (ogUrlMeta) {
        ogUrlMeta.setAttribute('content', nextUrl)
      }
      document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((link) => {
        const hreflang = link.getAttribute('hreflang')
        if (!hreflang) return
        const targetLocale =
          hreflang === 'x-default' ? DEFAULT_LOCALE : (resolveSupportedLocale(hreflang) ?? DEFAULT_LOCALE)
        link.setAttribute('href', new URL(localizePath(window.location.pathname, targetLocale), currentHref).toString())
      })
    } catch {
      // Ignore relative or non-URL canonical hrefs in isolated test fixtures.
    }
  }
}

applyDocumentLanguage(useI18nStore.getState().locale)
useI18nStore.subscribe((state, previous) => {
  if (state.locale !== previous.locale) {
    applyDocumentLanguage(state.locale)
  }
})
