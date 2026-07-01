import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Theme, ThemeStore } from './types'

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',

      toggleTheme: () => {
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        })
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      merge: (persisted, current) => {
        const stored = (persisted as { theme: Theme }).theme
        if (stored) {
          applyTheme(stored)
          return { ...current, theme: stored }
        }

        const system = prefersDark() ? 'dark' : 'light'
        applyTheme(system)
        return { ...current, theme: system }
      },
    },
  ),
)
