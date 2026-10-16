import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildShell } from './shell'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site'

// The real template: a tag the shell writes cannot disappear from it unnoticed.
const ROOT = join(import.meta.dirname, '..', '..')
const INDEX_HTML = readFileSync(join(ROOT, 'index.html'), 'utf8')
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const metaContent = (html: string, attribute: 'name' | 'property', name: string): string[] =>
  [...html.matchAll(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`, 'g'))].map((match) => match[1])

describe('buildShell', () => {
  it('does_write_the_title_and_description_of_site_ts_when_index_html_holds_other_values', () => {
    const template = INDEX_HTML.replace(/<title>[^<]*<\/title>/, '<title>dev title</title>').replace(
      /(<meta (?:name="description"|property="og:title"|property="og:description") content=")[^"]*"/g,
      '$1dev value"',
    )

    const shell = buildShell(template)

    expect(shell.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${SITE_NAME}</title>`])
    expect(metaContent(shell, 'property', 'og:title')).toEqual([SITE_NAME])
    expect(metaContent(shell, 'name', 'description')).toEqual([SITE_DESCRIPTION])
    expect(metaContent(shell, 'property', 'og:description')).toEqual([SITE_DESCRIPTION])
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
