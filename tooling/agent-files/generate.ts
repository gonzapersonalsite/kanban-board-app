import { buildLlmsTxt } from './llmsTxt'
import { buildRobotsTxt } from './robotsTxt'
import { buildSitemap } from './sitemap'

export interface AgentFile {
  path: string
  source: string
  contentType: string
}

const PLAIN_TEXT = 'text/plain; charset=utf-8'

export const buildAgentFiles = (): AgentFile[] => [
  { path: '/llms.txt', source: buildLlmsTxt(), contentType: PLAIN_TEXT },
  { path: '/robots.txt', source: buildRobotsTxt(), contentType: PLAIN_TEXT },
  { path: '/sitemap.xml', source: buildSitemap(), contentType: 'application/xml; charset=utf-8' },
]
