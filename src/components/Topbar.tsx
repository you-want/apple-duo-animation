import { href } from '../router'
import type { Route } from '../router'

const NAV: { route: Route; label: string }[] = [
  { route: '/', label: '折叠研究' },
  { route: '/cover', label: '外屏交接' },
  { route: '/handoff', label: '对焦交接' },
]

export function Topbar({ route, tags }: { route: Route; tags: string[] }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark" aria-hidden />
        <span>Fold UI</span>
      </div>

      <nav className="topbar__nav">
        {NAV.map((n) => (
          <a
            key={n.route}
            className={n.route === route ? 'navlink is-on' : 'navlink'}
            href={href(n.route)}
            aria-current={n.route === route ? 'page' : undefined}
          >
            {n.label}
          </a>
        ))}
      </nav>

      <div className="topbar__tags">
        {tags.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>
    </header>
  )
}
