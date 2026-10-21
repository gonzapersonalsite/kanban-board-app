import { useEffect } from 'react'
import { DEFAULT_LOCALE, localizePath, resolveSupportedLocale } from '@/shared/i18n'

export interface PageMetaOptions {
  title: string
  description?: string
  robots?: string
}

export function usePageMeta({ title, description, robots }: PageMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title
    const previousDescription = getMetaContent('description')
    const previousOgTitle = getMetaContent('og:title')
    const previousOgDescription = getMetaContent('og:description')
    const previousRobots = getMetaContent('robots')
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const previousCanonicalHref = canonicalLink?.getAttribute('href') ?? undefined
    const previousOgUrl = getMetaContent('og:url')
    const alternateLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'))
    const previousAlternates = alternateLinks.map((link) => ({
      hreflang: link.getAttribute('hreflang') ?? '',
      href: link.getAttribute('href') ?? '',
    }))

    document.title = title
    setMeta('description', description)
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('robots', robots)

    if (robots?.includes('noindex')) {
      canonicalLink?.remove()
      alternateLinks.forEach((link) => link.remove())
      document.querySelector('meta[property="og:url"]')?.remove()
    } else if (canonicalLink && previousCanonicalHref) {
      try {
        const nextCanonical = new URL(window.location.pathname, previousCanonicalHref).toString()
        canonicalLink.setAttribute('href', nextCanonical)
        setMeta('og:url', nextCanonical)
        alternateLinks.forEach((link) => {
          const hreflang = link.getAttribute('hreflang')
          if (!hreflang) return
          const targetLocale =
            hreflang === 'x-default' ? DEFAULT_LOCALE : (resolveSupportedLocale(hreflang) ?? DEFAULT_LOCALE)
          link.setAttribute(
            'href',
            new URL(localizePath(window.location.pathname, targetLocale), previousCanonicalHref).toString(),
          )
        })
      } catch {
        // Ignore relative or non-URL canonical hrefs in isolated test fixtures.
      }
    }

    return () => {
      document.title = previousTitle
      setMeta('description', previousDescription)
      setMeta('og:title', previousOgTitle ?? previousTitle)
      setMeta('og:description', previousOgDescription ?? previousDescription)
      if (previousCanonicalHref !== undefined) {
        let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        if (!link) {
          link = document.createElement('link')
          link.setAttribute('rel', 'canonical')
          document.head.appendChild(link)
        }
        link.setAttribute('href', previousCanonicalHref)
      }
      if (previousAlternates.length > 0) {
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove())
        previousAlternates.forEach(({ hreflang, href }) => {
          const link = document.createElement('link')
          link.setAttribute('rel', 'alternate')
          link.setAttribute('hreflang', hreflang)
          link.setAttribute('href', href)
          document.head.appendChild(link)
        })
      }
      if (previousOgUrl !== undefined) {
        setMeta('og:url', previousOgUrl)
      }
      if (robots !== undefined) {
        if (previousRobots === undefined) {
          document.querySelector('meta[name="robots"]')?.remove()
        } else {
          setMeta('robots', previousRobots)
        }
      }
    }
  }, [title, description, robots])
}

function getMetaContent(name: string): string | undefined {
  const attr = name.startsWith('og:') ? 'property' : 'name'
  return document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)?.getAttribute('content') ?? undefined
}

function setMeta(name: string, content?: string) {
  if (content === undefined) return
  const attr = name.startsWith('og:') ? 'property' : 'name'
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}
