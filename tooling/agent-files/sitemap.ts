import { absoluteUrl } from './site'

// Only the root: the board and calendar addresses name the boards each visitor keeps in their own browser.
const PUBLIC_PATHS: readonly string[] = ['/']

export const buildSitemap = (): string => {
  const urls = PUBLIC_PATHS.map((path) => `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
