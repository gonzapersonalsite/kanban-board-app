import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from './site.ts'

type HtmlEdit = (html: string) => string

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
    const matches = [...html.matchAll(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"\\s*/>`, 'g'))]
    if (matches.length !== 1) {
      throw new Error(`agent-files: expected exactly one meta ${name}, found ${matches.length}`)
    }

    const [tag, content] = matches[0]
    return html.replace(tag, () => `<meta ${attribute}="${name}" content="${escapeHtml(update(content))}" />`)
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
const SHELL_EDITS: readonly HtmlEdit[] = [
  replaceTitle(SITE_NAME),
  updateMeta('name', 'description', () => SITE_DESCRIPTION),
  updateMeta('property', 'og:title', () => SITE_NAME),
  updateMeta('property', 'og:description', () => SITE_DESCRIPTION),
  updateMeta('property', 'og:url', () => absoluteUrl('/')),
  updateMeta('property', 'og:image', absoluteImagePath('og:image')),
  updateMeta('name', 'twitter:image', absoluteImagePath('twitter:image')),
]

export const buildShell = (template: string): string => SHELL_EDITS.reduce((html, edit) => edit(html), template)
