import { Artwork } from '../ui/bits'

/**
 * Cover display for the hand-off study.
 *
 * The artwork is authored at exactly the rect `COVER_ART` describes (60% of the
 * cover's inner box, centred at 46% height), which is what lets the flight layer
 * start on top of it with no measurement step — the two agree by construction.
 * The hero is also centred horizontally, so the folded half's mirror is a no-op
 * on x and only the 9px bezel inset has to be accounted for.
 */
export function NowPlayingCover() {
  return (
    <div className="cover2">
      <div className="cover2__pill" aria-hidden />
      <div className="cover2__time">9:41</div>
      <div className="cover2__date">9月9日 星期三</div>

      <div className="cover2__art">
        <Artwork tone="a" disc />
      </div>

      <div className="cover2__meta">
        <strong>Nightcall</strong>
        <span>Kavinsky · OutRun</span>
      </div>

      <div className="cover2__scrub" aria-hidden>
        <i />
      </div>

      <div className="cover2__hint">展开</div>
    </div>
  )
}
