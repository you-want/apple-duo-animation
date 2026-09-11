import type { ReactNode } from 'react'
import { CoverScreen } from './CoverScreen'
import type { Tone } from './ui/bits'

export interface FoldDeviceProps {
  /** The 2×panel-wide inner display canvas. Rendered once per half. */
  children: ReactNode
  /** Cover display content, shown while the device is shut. */
  cover: { tone: Tone; title: string; artist: string }
  /** Replaces the default cover screen entirely (used by the hand-off study). */
  coverNode?: ReactNode
  /** Shared element parked in camera space — see `TransferLayer`. */
  flight?: ReactNode
  float?: boolean
}

export function FoldDevice({ children, cover, coverNode, flight, float = false }: FoldDeviceProps) {
  return (
    <div className="fold-stage">
      <div className="fold-ambient" aria-hidden />
      <div className="fold-shadow" aria-hidden />

      <div className={float ? 'fold-camera fold-camera--float' : 'fold-camera'}>
        {/* Left half — rigid, never moves. */}
        <div className="fold-panel fold-panel--left">
          <div className="panel__screen">
            <div className="panel__screen-inner">{children}</div>
            <div className="panel__crease" aria-hidden />
            <div className="panel__gloss" aria-hidden />
          </div>
        </div>

        {/* Right half — the hinge. Everything about this element is `--fold`. */}
        <div className="fold-panel fold-panel--right">
          <div className="panel__screen">
            <div className="panel__screen-inner">{children}</div>
            <div className="panel__crease" aria-hidden />
            <div className="panel__gloss" aria-hidden />
          </div>
          <div className="panel__outer">
            <div className="panel__outer-inner">
              {coverNode ?? (
                <CoverScreen tone={cover.tone} title={cover.title} artist={cover.artist} />
              )}
            </div>
          </div>
        </div>

        <div className="fold-hinge" aria-hidden />
      </div>

      {/* Sibling of the camera, not a child: see `.fold-flight` for why. */}
      {flight}
    </div>
  )
}
