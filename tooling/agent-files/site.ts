// What the site says about itself where the app does not run: the social preview of index.html
// and the agent files, both written by the build (vitePlugin.ts). The app never needs its own
// address, so this is the one place that names it.
export const SITE_URL = 'https://kanban-board-app-kappa.vercel.app'

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`

export const SITE_NAME = 'Kanban Board'

// The card of the whole site. Each view writes its own title and description at runtime
// (usePageMeta), which crawlers never see.
export const SITE_DESCRIPTION =
  'A Trello-style Kanban board that runs fully in the browser: multiple boards, drag and drop, calendar view and JSON backup. No backend and no account: your data stays in your browser.'

export const REPOSITORY_URL = 'https://github.com/gonzapersonalsite/kanban-board-app'

// Only the root: the board and calendar addresses name the boards each visitor keeps in their own browser.
export const ROUTES: readonly string[] = ['/']

export const DOCUMENTS: readonly (readonly [string, string])[] = [
  ['README.md', 'features, stack and how to run it.'],
  ['docs/ARCHITECTURE.md', 'the Feature-Sliced Design rules of the code and what enforces each one.'],
]
