import { Sun, Moon } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { useThemeStore } from '@/shared/theme'
import styles from './ThemeSwitcher.module.css'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleTheme}
      aria-label={t(theme === 'light' ? 'theme.switch_to_dark' : 'theme.switch_to_light')}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  )
}
