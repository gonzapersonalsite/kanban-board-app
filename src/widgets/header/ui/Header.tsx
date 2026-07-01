import { NavLink } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { LanguageSwitcher } from '@/features/language-switcher'
import { ThemeSwitcher } from '@/features/theme-switcher'
import { AppIcon } from '@/shared/ui'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'nav.board', end: true },
  { to: '/calendar', label: 'nav.calendar', end: false },
] as const

export function Header() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <AppIcon />
      <h1 className={styles.title}>{t('app.title')}</h1>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={styles.navLink}
          >
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
      <div className={styles.actions}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
