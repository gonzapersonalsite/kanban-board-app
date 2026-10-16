import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from './site'

export const REPOSITORY_URL = 'https://github.com/gonzapersonalsite/kanban-board-app'
const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'

// A document of this repository as GitHub shows it on the default branch.
const repositoryDocumentUrl = (path: string): string => `${REPOSITORY_URL}/blob/main/${path}`

// The llmstxt.org format: a title, a one-line summary, and sections of links.
export const buildLlmsTxt = (): string =>
  [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'The app is a single-page application in English, Spanish and German: its views are drawn in the browser with JavaScript, so their HTML holds no readable content. The links below describe it.',
    '',
    '## App',
    '',
    `- [Live demo](${absoluteUrl('/')}): opens a sample board on the first visit; nothing is saved until you change something.`,
    `- [Source code](${REPOSITORY_URL}): React, TypeScript, Zustand and Feature-Sliced Design.`,
    '',
    '## Docs',
    '',
    `- [README](${repositoryDocumentUrl('README.md')}): features, stack and how to run it.`,
    `- [Architecture](${repositoryDocumentUrl('docs/ARCHITECTURE.md')}): the Feature-Sliced Design rules of the code and what enforces each one.`,
    '',
    '## Optional',
    '',
    `- [Author's portfolio](${PORTFOLIO_URL}): Gonzalo Martínez, Junior Full Stack Developer.`,
    '',
  ].join('\n')
