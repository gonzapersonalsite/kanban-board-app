import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import indexHtml from '../../../../index.html?raw'
import type { Theme } from './types'

const THEME_STORAGE_KEY = 'theme-preference'
const prePaintScript = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''

function runPrePaintScript() {
  new Function(prePaintScript)()
}

function stubSystemColorScheme(scheme: Theme) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' && scheme === 'dark',
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

function storeTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ state: { theme }, version: 0 }))
}

// The store hydrates while its module loads, so each start needs a fresh module.
async function startThemeStore() {
  vi.resetModules()
  const { useThemeStore } = await import('./store')
  return useThemeStore
}

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('index.html pre-paint script', () => {
    it.each<Theme>(['light', 'dark'])('applies_the_saved_%s_theme_before_the_app_loads', (theme) => {
      stubSystemColorScheme(theme === 'light' ? 'dark' : 'light')
      storeTheme(theme)

      runPrePaintScript()

      expect(document.documentElement.getAttribute('data-theme')).toBe(theme)
      expect(document.documentElement.style.colorScheme).toBe(theme)
    })

    it.each<Theme>(['light', 'dark'])(
      'follows_the_%s_system_preference_when_nothing_valid_is_stored_before_the_app_loads',
      (scheme) => {
        stubSystemColorScheme(scheme)
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ state: { theme: 'sepia' }, version: 0 }))

        runPrePaintScript()

        expect(document.documentElement.getAttribute('data-theme')).toBe(scheme)
        expect(document.documentElement.style.colorScheme).toBe(scheme)
      },
    )

    it('follows_the_system_preference_when_site_data_is_blocked', () => {
      stubSystemColorScheme('dark')
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('blocked', 'SecurityError')
      })

      runPrePaintScript()

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(document.documentElement.style.colorScheme).toBe('dark')
    })

    it('promotes_the_font_stylesheet_from_print_to_all_when_it_finishes_loading', () => {
      stubSystemColorScheme('light')
      document.head.innerHTML =
        '<link id="app-fonts" rel="stylesheet" href="https://fonts.googleapis.com/css2" media="print" />'
      const fontsLink = document.getElementById('app-fonts') as HTMLLinkElement

      runPrePaintScript()
      expect(fontsLink.media).toBe('print')

      fontsLink.dispatchEvent(new Event('load'))

      expect(fontsLink.media).toBe('all')
    })
  })

  describe('first visit', () => {
    it.each<Theme>(['dark', 'light'])('follows_a_%s_system_preference_when_nothing_is_stored', async (scheme) => {
      stubSystemColorScheme(scheme)

      const useThemeStore = await startThemeStore()

      expect(useThemeStore.getState().theme).toBe(scheme)
      expect(document.documentElement.getAttribute('data-theme')).toBe(scheme)
      expect(document.documentElement.style.colorScheme).toBe(scheme)
    })

    it('keeps_following_the_system_until_the_visitor_chooses_a_theme', async () => {
      stubSystemColorScheme('dark')

      await startThemeStore()

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    })

    it('switches_away_from_the_system_theme_and_stores_the_choice_on_toggle', async () => {
      stubSystemColorScheme('dark')
      const useThemeStore = await startThemeStore()

      useThemeStore.getState().toggleTheme()

      expect(useThemeStore.getState().theme).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(document.documentElement.style.colorScheme).toBe('light')
      expect(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}').state).toEqual({ theme: 'light' })
    })
  })

  describe('returning visit', () => {
    it('prefers_the_stored_theme_over_the_system_preference', async () => {
      stubSystemColorScheme('dark')
      storeTheme('light')

      const useThemeStore = await startThemeStore()

      expect(useThemeStore.getState().theme).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(document.documentElement.style.colorScheme).toBe('light')
    })
  })
})
