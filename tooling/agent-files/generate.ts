import { buildLlmsTxt } from './llmsTxt.ts'
import { buildRobotsTxt } from './robotsTxt.ts'
import { buildSitemap } from './sitemap.ts'

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
