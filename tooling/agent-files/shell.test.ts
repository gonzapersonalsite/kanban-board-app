import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildShell } from './shell.ts'
import { SHELL_LOCALES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site.ts'

// The real template: a tag the shell writes cannot disappear from it unnoticed.
const ROOT = join(import.meta.dirname, '..', '..')
const INDEX_HTML = readFileSync(join(ROOT, 'index.html'), 'utf8')
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const metaContent = (html: string, attribute: 'name' | 'property', name: string): string[] =>
  [...html.matchAll(new RegExp(`<meta\\s+${attribute}="${name}"\\s+content="([^"]*)"`, 'g'))].map((match) => match[1])

const linkHref = (html: string, rel: string, hreflang?: string): string[] => {
  const pattern = hreflang
    ? new RegExp(`<link\\s+rel="${rel}"\\s+hreflang="${hreflang}"\\s+href="([^"]*)"`, 'g')
    : new RegExp(`<link\\s+rel="${rel}"\\s+href="([^"]*)"`, 'g')
  return [...html.matchAll(pattern)].map((match) => match[1])
}

describe('buildShell', () => {
  it('does_write_the_spanish_default_shell_and_prefixed_english_and_german_shells_from_site_ts', () => {
    const template = INDEX_HTML.replace(/<title>[^<]*<\/title>/, '<title>dev title</title>').replace(
      /(<meta\s+(?:name="description"|property="og:title"|property="og:description")\s+content=")[^"]*"/g,
      '$1dev value"',
    )

    const esShell = buildShell(template, 'es')
    const enShell = buildShell(template, 'en')
    const deShell = buildShell(template, 'de')
    const esConfig = SHELL_LOCALES.find((shell) => shell.locale === 'es')!
    const deConfig = SHELL_LOCALES.find((shell) => shell.locale === 'de')!

    expect(esShell).toContain('<html lang="es">')
    expect(esShell.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${esConfig.title}</title>`])
    expect(metaContent(esShell, 'property', 'og:locale')).toEqual(['es_ES'])
    expect(metaContent(esShell, 'property', 'og:title')).toEqual([esConfig.title])
    expect(metaContent(esShell, 'name', 'description')).toEqual([esConfig.description])
    expect(metaContent(esShell, 'property', 'og:description')).toEqual([esConfig.description])
    expect(linkHref(esShell, 'canonical')).toEqual([`${SITE_URL}/`])

    expect(enShell).toContain('<html lang="en">')
    expect(enShell.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${SITE_NAME}</title>`])
    expect(metaContent(enShell, 'property', 'og:locale')).toEqual(['en_US'])
    expect(metaContent(enShell, 'property', 'og:title')).toEqual([SITE_NAME])
    expect(metaContent(enShell, 'name', 'description')).toEqual([SITE_DESCRIPTION])
    expect(metaContent(enShell, 'property', 'og:description')).toEqual([SITE_DESCRIPTION])
    expect(metaContent(enShell, 'property', 'og:url')).toEqual([`${SITE_URL}/en`])
    expect(linkHref(enShell, 'canonical')).toEqual([`${SITE_URL}/en`])

    expect(deShell).toContain('<html lang="de">')
    expect(deShell.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${deConfig.title}</title>`])
    expect(metaContent(deShell, 'property', 'og:locale')).toEqual(['de_DE'])
    expect(metaContent(deShell, 'property', 'og:url')).toEqual([`${SITE_URL}/de`])
    expect(linkHref(deShell, 'canonical')).toEqual([`${SITE_URL}/de`])

    for (const shell of [esShell, enShell, deShell]) {
      expect(linkHref(shell, 'alternate', 'es')).toEqual([`${SITE_URL}/`])
      expect(linkHref(shell, 'alternate', 'en')).toEqual([`${SITE_URL}/en`])
      expect(linkHref(shell, 'alternate', 'de')).toEqual([`${SITE_URL}/de`])
      expect(linkHref(shell, 'alternate', 'x-default')).toEqual([`${SITE_URL}/`])
    }
  })

  it('does_point_the_preview_at_absolute_addresses_of_the_site_when_index_html_names_root_relative_paths', () => {
    const [imagePath] = metaContent(INDEX_HTML, 'property', 'og:image')

    const shell = buildShell(INDEX_HTML)

    expect(imagePath.startsWith('/')).toBe(true)
    expect(metaContent(shell, 'property', 'og:url')).toEqual([`${SITE_URL}/`])
    expect(metaContent(shell, 'property', 'og:image')).toEqual([`${SITE_URL}${imagePath}`])
    expect(metaContent(shell, 'name', 'twitter:image')).toEqual([`${SITE_URL}${imagePath}`])
  })

  it('does_give_every_platform_the_same_image_and_alt_text_when_the_shell_is_built', () => {
    const shell = buildShell(INDEX_HTML)

    const alt = metaContent(shell, 'property', 'og:image:alt')

    expect(alt).toHaveLength(1)
    expect(alt[0]).not.toBe('')
    expect(metaContent(shell, 'name', 'twitter:image:alt')).toEqual(alt)
    expect(metaContent(shell, 'name', 'twitter:image')).toEqual(metaContent(shell, 'property', 'og:image'))
    expect(metaContent(shell, 'name', 'twitter:card')).toEqual(['summary_large_image'])
  })

  it('does_declare_the_real_type_and_size_of_the_cover_when_index_html_names_it', () => {
    const [imagePath] = metaContent(INDEX_HTML, 'property', 'og:image')
    const cover = readFileSync(join(ROOT, 'public', imagePath))

    const size = { width: cover.readUInt32BE(16), height: cover.readUInt32BE(20) }

    expect(cover.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)).toBe(true)
    expect(metaContent(INDEX_HTML, 'property', 'og:image:type')).toEqual(['image/png'])
    expect(metaContent(INDEX_HTML, 'property', 'og:image:width')).toEqual([String(size.width)])
    expect(metaContent(INDEX_HTML, 'property', 'og:image:height')).toEqual([String(size.height)])
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  it('does_refuse_the_template_when_a_social_image_is_not_a_root_relative_path', () => {
    const hardcoded = INDEX_HTML.replace(
      '<meta property="og:image" content="/',
      '<meta property="og:image" content="https://example.com/',
    )

    const build = () => buildShell(hardcoded)

    expect(build).toThrow(/og:image must be a root-relative path/)
  })

  it('does_refuse_the_template_when_a_tag_it_writes_is_missing_or_repeated', () => {
    const withoutUrl = INDEX_HTML.replace(/<meta property="og:url"[^>]*>/, '')
    const twoTitles = INDEX_HTML.replace('</head>', '<title>again</title></head>')

    const buildWithoutUrl = () => buildShell(withoutUrl)
    const buildWithTwoTitles = () => buildShell(twoTitles)

    expect(buildWithoutUrl).toThrow(/expected exactly one meta og:url, found 0/)
    expect(buildWithTwoTitles).toThrow(/expected exactly one <title>, found 2/)
  })
})
