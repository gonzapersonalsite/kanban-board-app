import { useTranslation } from '@/shared/i18n'
import { LanguageSwitcher } from '@/features/language-switcher'
import { AppIcon } from '@/shared/ui'
import styles from './Header.module.css'

export function Header() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <AppIcon />
      <h1 className={styles.title}>{t('app.title')}</h1>
      <LanguageSwitcher />
    </header>
  )
}
