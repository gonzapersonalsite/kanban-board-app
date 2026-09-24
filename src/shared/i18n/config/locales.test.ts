import { describe, expect, it } from 'vitest'
import { flattenTranslations } from '../lib/translations'

const localeFiles = import.meta.glob<Record<string, unknown>>('./*.json', {
  eager: true,
  import: 'default',
})

const locales = Object.fromEntries(
  Object.entries(localeFiles).map(([path, messages]) => [
    path.replace(/^\.\/(.+)\.json$/, '$1'),
    flattenTranslations(messages),
  ]),
)

const { en: english, ...translations } = locales

function placeholdersOf(message: string): string[] {
  return (message.match(/\{\{\w+\}\}/g) ?? []).sort()
}

describe('locale files', () => {
  it('ships_spanish_and_german_next_to_english', () => {
    expect(Object.keys(locales)).toEqual(expect.arrayContaining(['en', 'es', 'de']))
  })

  it.each(Object.entries(translations))(
    'has_the_same_flattened_keys_as_english_in_%s',
    (_locale, messages) => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort())
    },
  )

  it.each(Object.entries(translations))(
    'keeps_the_english_placeholders_in_every_%s_message',
    (_locale, messages) => {
      for (const [key, message] of Object.entries(english)) {
        expect({ key, placeholders: placeholdersOf(messages[key] ?? '') }).toEqual({
          key,
          placeholders: placeholdersOf(message),
        })
      }
    },
  )

  it.each(Object.entries(locales))('has_no_empty_messages_in_%s', (_locale, messages) => {
    const emptyKeys = Object.entries(messages)
      .filter(([, message]) => message.trim() === '')
      .map(([key]) => key)

    expect(emptyKeys).toEqual([])
  })
})
