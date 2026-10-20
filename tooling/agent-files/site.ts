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

export type ShellLocale = 'es' | 'en' | 'de'

export interface LocalizedShellConfig {
  readonly locale: ShellLocale
  readonly ogLocale: string
  readonly path: string
  readonly fileName: string
  readonly title: string
  readonly loadingLabel: string
  readonly description: string
}

export const SHELL_LOCALES: readonly LocalizedShellConfig[] = [
  {
    locale: 'es',
    ogLocale: 'es_ES',
    path: '/',
    fileName: 'index.html',
    title: 'Tablero Kanban',
    loadingLabel: 'Cargando Tablero Kanban',
    description:
      'Un tablero Kanban al estilo Trello que corre entero en el navegador: múltiples tableros, arrastrar y soltar, vista de calendario y copia de seguridad en JSON. Sin backend ni cuenta: tus datos se quedan en tu navegador.',
  },
  {
    locale: 'en',
    ogLocale: 'en_US',
    path: '/en',
    fileName: 'en/index.html',
    title: SITE_NAME,
    loadingLabel: 'Loading Kanban Board',
    description: SITE_DESCRIPTION,
  },
  {
    locale: 'de',
    ogLocale: 'de_DE',
    path: '/de',
    fileName: 'de/index.html',
    title: 'Kanban-Board',
    loadingLabel: 'Kanban-Board wird geladen',
    description:
      'Ein Kanban-Board im Trello-Stil, das vollständig im Browser läuft: mehrere Boards, Drag-and-Drop, Kalenderansicht und JSON-Backup. Kein Backend und kein Konto: Ihre Daten bleiben in Ihrem Browser.',
  },
]

export const REPOSITORY_URL = 'https://github.com/gonzapersonalsite/kanban-board-app'

// The localized entry routes; the board and calendar addresses name the boards each visitor keeps in their own browser.
export const ROUTES: readonly string[] = SHELL_LOCALES.map((shell) => shell.path)

export const DOCUMENTS: readonly (readonly [string, string])[] = [
  ['README.md', 'features, stack and how to run it.'],
  ['docs/ARCHITECTURE.md', 'the Feature-Sliced Design rules of the code and what enforces each one.'],
]
