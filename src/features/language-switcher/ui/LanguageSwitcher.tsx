import { useI18nStore } from '@/shared/i18n'
import styles from './LanguageSwitcher.module.css'

const LABELS: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  de: 'DE',
}

export function LanguageSwitcher() {
  const locale = useI18nStore((state) => state.locale)
  const setLocale = useI18nStore((state) => state.setLocale)
  const availableLocales = useI18nStore((state) => state.availableLocales)

  return (
    <select
      className={styles.select}
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
