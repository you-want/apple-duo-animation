import { Artwork } from './ui/bits'
import type { Tone } from './ui/bits'

/**
 * The outer display. Lives on the *back* of the folding half, so it is what you
 * see when the device is shut — and it rotates away on its own as the device
 * opens. No opacity trickery required.
 */
export function CoverScreen({ tone, title, artist }: { tone: Tone; title: string; artist: string }) {
  return (
    <div className="cover">
      <div className="cover__pill" aria-hidden />
      <div className="cover__time">9:41</div>
      <div className="cover__date">9月9日 星期三</div>

      <div className="cover__widgets">
        <div className="cw">
          <span className="cw__big">21°</span>
          <span className="cw__small">多云 · 上海</span>
        </div>
        <div className="cw cw--row">
          <span className="cw__icon" aria-hidden />
          <span className="cw__small">
            10:30 设计评审
            <br />
            14:00 与 Apple 同步
          </span>
        </div>
      </div>

      <div className="cover__np">
        <div className="cover__np-art">
          <Artwork tone={tone} disc />
        </div>
        <div className="cover__np-meta">
          <strong>{title}</strong>
          <span>{artist}</span>
        </div>
        <div className="cover__np-wave" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.13}s` }} />
          ))}
        </div>
      </div>

      <div className="cover__hint">展开以查看全部</div>
    </div>
  )
}
