export type Theme = 'light' | 'dark'

export interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}
