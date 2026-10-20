import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_LOCALE,
  extractPathLocale,
  localizePath,
  resolveSupportedLocale,
  stripLocalePrefix,
  useI18nStore,
} from '@/shared/i18n'

function isRedirectEntryPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname)
  return stripped === '/' || stripped === '/calendar'
}

export function useSyncLocaleRoute(): void {
  const location = useLocation()
  const navigate = useNavigate()
  const locale = useI18nStore((state) => state.locale)
  const setLocale = useI18nStore((state) => state.setLocale)
  const hasMountedRef = useRef(false)
  const previousLocaleRef = useRef(locale)
  const previousPathnameRef = useRef(location.pathname)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const queryLocale = resolveSupportedLocale(params.get('lang'))

    if (queryLocale) {
      if (locale !== queryLocale) {
        setLocale(queryLocale)
      }
      previousLocaleRef.current = queryLocale
      hasMountedRef.current = true
      if (!isRedirectEntryPath(location.pathname)) {
        params.delete('lang')
        const nextSearch = params.toString()
        const nextPathname = localizePath(location.pathname, queryLocale)
        previousPathnameRef.current = nextPathname
        navigate(
          {
            pathname: nextPathname,
            search: nextSearch ? `?${nextSearch}` : '',
            hash: location.hash,
          },
          { replace: true },
        )
      }
      return
    }

    const pathLocale = extractPathLocale(location.pathname)

    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      if (pathLocale && pathLocale !== locale) {
        setLocale(pathLocale)
        previousLocaleRef.current = pathLocale
        previousPathnameRef.current = location.pathname
        return
      }
      if (!pathLocale && locale !== DEFAULT_LOCALE && !isRedirectEntryPath(location.pathname)) {
        const nextPathname = localizePath(location.pathname, locale)
        if (nextPathname !== location.pathname) {
          previousPathnameRef.current = nextPathname
          navigate(
            {
              pathname: nextPathname,
              search: location.search,
              hash: location.hash,
            },
            { replace: true },
          )
          return
        }
      }
      previousLocaleRef.current = locale
      previousPathnameRef.current = location.pathname
      return
    }

    if (locale !== previousLocaleRef.current) {
      previousLocaleRef.current = locale
      const nextPathname = localizePath(location.pathname, locale)
      if (nextPathname !== location.pathname) {
        previousPathnameRef.current = nextPathname
        navigate(
          {
            pathname: nextPathname,
            search: location.search,
            hash: location.hash,
          },
          { replace: true },
        )
        return
      }
    } else if (location.pathname !== previousPathnameRef.current) {
      const routeLocale = pathLocale ?? DEFAULT_LOCALE
      if (routeLocale !== locale) {
        setLocale(routeLocale)
        previousLocaleRef.current = routeLocale
      }
    }

    previousLocaleRef.current = locale
    previousPathnameRef.current = location.pathname
  }, [locale, location.hash, location.pathname, location.search, navigate, setLocale])
}
