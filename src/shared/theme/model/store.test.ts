import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Theme } from './types'

const THEME_STORAGE_KEY = 'theme-preference'

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
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('first visit', () => {
    it.each<Theme>(['dark', 'light'])('follows_a_%s_system_preference_when_nothing_is_stored', async (scheme) => {
      stubSystemColorScheme(scheme)

      const useThemeStore = await startThemeStore()

      expect(useThemeStore.getState().theme).toBe(scheme)
      expect(document.documentElement.getAttribute('data-theme')).toBe(scheme)
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
    })
  })
})
