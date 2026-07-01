import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/shared/theme'
import styles from './ThemeSwitcher.module.css'

export function ThemeSwitcher() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <button
      className={styles.button}
      onClick={toggleTheme}
      aria-label={
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      }
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
