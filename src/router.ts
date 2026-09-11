import { useEffect, useState } from 'react'

export type Route = '/' | '/cover' | '/handoff'

const read = (): Route =>
  window.location.hash.replace(/^#/, '') === '/cover'
    ? '/cover'
    : window.location.hash.replace(/^#/, '') === '/handoff'
      ? '/handoff'
      : '/'

/** Hash routing: no dependency, and the built `dist/` works off any static host. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const onHash = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export const href = (r: Route) => `#${r}`
