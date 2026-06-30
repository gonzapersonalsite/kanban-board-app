import type { TranslationMap } from '../model/types'

export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = '',
): TranslationMap {
  const result: TranslationMap = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenTranslations(value as Record<string, unknown>, fullKey),
      )
    } else {
      result[fullKey] = String(value)
    }
  }

  return result
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key]
    return value !== undefined ? String(value) : `{{${key}}}`
  })
}
