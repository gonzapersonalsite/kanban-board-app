import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { absoluteUrl, DOCUMENTS, REPOSITORY_URL, SITE_DESCRIPTION, SITE_NAME } from './site.ts'

const ROOT = join(import.meta.dirname, '..', '..')
const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'

// A document of this repository as GitHub shows it on the default branch.
const repositoryDocumentUrl = (path: string): string => `${REPOSITORY_URL}/blob/main/${path}`

// The llmstxt.org format: a title, a one-line summary, and sections of links.
export const buildLlmsTxt = (): string => {
  const documents = DOCUMENTS.filter(([path]) => existsSync(join(ROOT, path))).map(
    ([path, description]) => `- [${path}](${repositoryDocumentUrl(path)}): ${description}`,
  )

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'The app is a single-page application in Spanish, English and German: its views are drawn in the browser with JavaScript, so their HTML holds no readable content. The links below describe it.',
    '',
    '## App',
    '',
    `- [Live demo (Spanish, default)](${absoluteUrl('/')}): opens a sample board on the first visit; nothing is saved until you change something.`,
    `- [Live demo (English)](${absoluteUrl('/en')}): English entry route.`,
    `- [Live demo (German)](${absoluteUrl('/de')}): German entry route.`,
    `- [Source code](${REPOSITORY_URL}): React, TypeScript, Zustand and Feature-Sliced Design.`,
    '',
    '## Docs',
    '',
    ...documents,
    '',
    '## Optional',
    '',
    `- [Author's portfolio](${PORTFOLIO_URL}): Gonzalo Martínez, Full Stack Developer.`,
    '',
  ].join('\n')
}
