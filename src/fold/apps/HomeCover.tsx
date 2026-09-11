import { WidgetStack } from './HomeSurface'

/**
 * The outer display for the focus study.
 *
 * Deliberately not a scaled-down copy of the inner screen — it is the *same*
 * widget stack the inner canvas puts in its left half, dropped into a portrait
 * box of almost exactly the same aspect. That is what makes the hand-off read
 * as one continuous picture: nothing is redrawn, nothing is cross-faded, the
 * sharpness is the only thing that changes.
 */
export function HomeCover() {
  return (
    <div className="hc">
      <div className="hc__pill" aria-hidden />
      <div className="hc__time">9:41</div>
      <div className="hc__date">10月9日 周三</div>

      <WidgetStack />

      <div className="hc__hint">展开</div>
    </div>
  )
}
