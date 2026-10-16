import { absoluteUrl } from './site'

export const buildRobotsTxt = (): string => `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
