import type { ReactNode } from 'react'

/**
 * The shared element.
 *
 * Rendered in *camera* space, not inside either half. That is the whole trick:
 * the cover display can rotate away underneath it while the hero holds still,
 * and it is never clipped by a panel it is in the middle of leaving.
 *
 * Both endpoints are plain scalars written by `writeFoldVars`, so this component
 * has no state and no measurement step — it is a function of `--t-fly`.
 */
export function TransferLayer({ children }: { children: ReactNode }) {
  return (
    <div className="fold-flight" aria-hidden>
      <div className="flight-clip flight-clip--left">
        <div className="flight__body flight__body--cover">{children}</div>
      </div>
      <div className="flight-clip flight-clip--right">
        <div className="flight__body flight__body--air">{children}</div>
      </div>
    </div>
  )
}
