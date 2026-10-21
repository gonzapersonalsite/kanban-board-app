import { useEffect } from 'react'

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

    document.title = title
    setMeta('description', description)
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('robots', robots)

    return () => {
      document.title = previousTitle
      setMeta('description', previousDescription)
      setMeta('og:title', previousOgTitle ?? previousTitle)
      setMeta('og:description', previousOgDescription ?? previousDescription)
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
