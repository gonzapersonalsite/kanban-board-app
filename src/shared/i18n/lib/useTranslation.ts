import { useI18nStore } from '../model/store'

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale)

  const t = (key: string, params?: Record<string, string | number>) =>
    useI18nStore.getState().t(key, params)

  const setLocale = useI18nStore((s) => s.setLocale)
  const availableLocales = useI18nStore((s) => s.availableLocales)

  return { t, locale, setLocale, availableLocales }
}
