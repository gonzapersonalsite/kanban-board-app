import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildAgentFiles } from './generate.ts'
import { absoluteUrl, DOCUMENTS, REPOSITORY_URL, ROUTES, SITE_DESCRIPTION, SITE_NAME } from './site.ts'
import { buildSitemap } from './sitemap.ts'

const ROOT = join(import.meta.dirname, '..', '..')

const sourceOf = (path: string): string => {
  const file = buildAgentFiles().find((candidate) => candidate.path === path)
  if (file === undefined) throw new Error(`no agent file ${path}`)
  return file.source
}

describe('buildAgentFiles', () => {
  it('does_publish_llms_robots_and_sitemap_once_each_when_the_files_are_built', () => {
    const files = buildAgentFiles()

    const paths = files.map((file) => file.path)

    expect(paths).toEqual(['/llms.txt', '/robots.txt', '/sitemap.xml'])
    expect(files.every((file) => file.contentType.endsWith('; charset=utf-8'))).toBe(true)
  })

  it('does_point_robots_txt_at_the_sitemap_when_crawling_is_allowed', () => {
    const robots = sourceOf('/robots.txt')

    const lines = robots.split('\n')

    expect(lines).toContain('User-agent: *')
    expect(lines).toContain('Allow: /')
    expect(lines).toContain(`Sitemap: ${absoluteUrl('/sitemap.xml')}`)
  })

  it('does_list_the_public_routes_of_site_ts_when_the_sitemap_is_built', () => {
    const sitemap = sourceOf('/sitemap.xml')

    const locations = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1])

    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true)
    expect(locations).toEqual(ROUTES.map((route) => absoluteUrl(route)))
  })

  it('does_escape_xml_entities_in_sitemap_locations_when_routes_contain_reserved_characters', () => {
    const sitemap = buildSitemap(['/tasks?filter=pending&sort=asc'])

    expect(sitemap).toContain(`<loc>${absoluteUrl('/tasks?filter=pending&amp;sort=asc')}</loc>`)
    expect(DOCUMENTS.length).toBeGreaterThanOrEqual(2)
  })

  it('does_summarize_the_site_with_the_texts_of_site_ts_when_llms_txt_is_built', () => {
    const llms = sourceOf('/llms.txt')

    const [heading, , summary] = llms.split('\n')

    expect(heading).toBe(`# ${SITE_NAME}`)
    expect(summary).toBe(`> ${SITE_DESCRIPTION}`)
    expect(llms).toContain(`](${absoluteUrl('/')})`)
  })

  it('does_link_only_documents_of_this_repository_that_exist_when_llms_txt_names_them', () => {
    const llms = sourceOf('/llms.txt')

    const documentPrefix = `${REPOSITORY_URL}/blob/main/`
    const documents = [...llms.matchAll(/\]\(([^)]+)\)/g)]
      .map((match) => match[1])
      .filter((link) => link.startsWith(documentPrefix))
      .map((link) => link.slice(documentPrefix.length))

    // The README is always there; the architecture document arrives with the scaffold's layer.
    expect(documents).toEqual([
      'README.md',
      ...(existsSync(join(ROOT, 'docs', 'ARCHITECTURE.md')) ? ['docs/ARCHITECTURE.md'] : []),
    ])
    expect(documents.filter((path) => !existsSync(join(ROOT, path)))).toEqual([])
  })

  it('does_return_the_same_files_when_built_twice', () => {
    const first = buildAgentFiles()

    const second = buildAgentFiles()

    expect(second).toEqual(first)
  })
})
