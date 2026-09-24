import { useTranslation } from '@/shared/i18n'
import styles from './LanguageSwitcher.module.css'

const LABELS: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  de: 'DE',
}

export function LanguageSwitcher() {
  const { t, locale, setLocale, availableLocales } = useTranslation()

  return (
    <select
      className={styles.select}
      aria-label={t('header.language')}
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
    >
      {availableLocales.map((code) => (
        <option key={code} value={code}>
          {LABELS[code] ?? code.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
