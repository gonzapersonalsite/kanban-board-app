import { absoluteUrl, SHELL_LOCALES, type LocalizedShellConfig, type ShellLocale } from './site.ts'

type HtmlEdit = (html: string) => string

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const getShellConfig = (locale: ShellLocale): LocalizedShellConfig => {
  const config = SHELL_LOCALES.find((candidate) => candidate.locale === locale)
  if (!config) {
    throw new Error(`agent-files: unknown shell locale "${locale}"`)
  }
  return config
}

const replaceHtmlLang =
  (locale: string): HtmlEdit =>
  (html) => {
    const matches = html.match(/<html\s+lang="[^"]*">/g) ?? []
    if (matches.length !== 1) {
      throw new Error(`agent-files: expected exactly one <html lang>, found ${matches.length}`)
    }

    return html.replace(matches[0], () => `<html lang="${escapeHtml(locale)}">`)
  }

// index.html is the only HTML source; the shell is wrong the moment a tag it expects
// disappears or repeats, so every edit refuses anything but one match.
const replaceTitle =
  (title: string): HtmlEdit =>
  (html) => {
    const matches = html.match(/<title>[\s\S]*?<\/title>/g) ?? []
    if (matches.length !== 1) {
      throw new Error(`agent-files: expected exactly one <title>, found ${matches.length}`)
    }

    return html.replace(matches[0], () => `<title>${escapeHtml(title)}</title>`)
  }

const updateMeta =
  (attribute: 'name' | 'property', name: string, update: (content: string) => string): HtmlEdit =>
  (html) => {
    // Prettier may wrap a long tag over several lines, so the spaces between its parts are any
    // whitespace, and the closing slash is optional.
    const matches = [...html.matchAll(new RegExp(`<meta\\s+${attribute}="${name}"\\s+content="([^"]*)"\\s*/?>`, 'g'))]
    if (matches.length !== 1) {
      throw new Error(`agent-files: expected exactly one meta ${name}, found ${matches.length}`)
    }

    const [tag, content] = matches[0]
    return html.replace(tag, () => `<meta ${attribute}="${name}" content="${escapeHtml(update(content))}" />`)
  }

const insertHeadLinks =
  (shell: LocalizedShellConfig): HtmlEdit =>
  (html) => {
    const matches = html.match(/<\/head>/g) ?? []
    if (matches.length !== 1) {
      throw new Error(`agent-files: expected exactly one </head>, found ${matches.length}`)
    }

    const links = [
      `<link rel="canonical" href="${escapeHtml(absoluteUrl(shell.path))}" />`,
      ...SHELL_LOCALES.map(
        (alternate) =>
          `<link rel="alternate" hreflang="${escapeHtml(alternate.locale)}" href="${escapeHtml(absoluteUrl(alternate.path))}" />`,
      ),
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl('/'))}" />`,
    ].join('\n    ')

    return html.replace('</head>', () => `    ${links}\n  </head>`)
  }

// index.html names the social image by its path, so the site address has one source (SITE_URL).
const absoluteImagePath =
  (name: string) =>
  (path: string): string => {
    if (!path.startsWith('/')) {
      throw new Error(`agent-files: ${name} must be a root-relative path, found "${path}"`)
    }
    return absoluteUrl(path)
  }

// The title, description and addresses of the preview come from site.ts; the values in
// index.html only serve the dev server.
const buildShellEdits = (shell: LocalizedShellConfig): readonly HtmlEdit[] => [
  replaceHtmlLang(shell.locale),
  replaceTitle(shell.title),
  updateMeta('name', 'description', () => shell.description),
  updateMeta('property', 'og:locale', () => shell.ogLocale),
  updateMeta('property', 'og:title', () => shell.title),
  updateMeta('property', 'og:description', () => shell.description),
  updateMeta('property', 'og:url', () => absoluteUrl(shell.path)),
  updateMeta('property', 'og:image', absoluteImagePath('og:image')),
  updateMeta('name', 'twitter:image', absoluteImagePath('twitter:image')),
  insertHeadLinks(shell),
]

export const buildShell = (template: string, locale: ShellLocale = 'es'): string =>
  buildShellEdits(getShellConfig(locale)).reduce((html, edit) => edit(html), template)
