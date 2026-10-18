import { absoluteUrl, ROUTES } from './site.ts'

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const buildSitemap = (routes: readonly string[] = ROUTES): string => {
  const urls = routes.map((path) => `  <url>\n    <loc>${escapeXml(absoluteUrl(path))}</loc>\n  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
