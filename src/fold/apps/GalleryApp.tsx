import { Artwork, HomeIndicator, StatusBar } from '../ui/bits'
import type { Tone } from '../ui/bits'

const SHOTS: Tone[] = ['d', 'a', 'b', 'e', 'c', 'f']

export function GalleryApp() {
  return (
    <div className="ui-root ui-root--gallery">
      <StatusBar />

      <div className="ui-hero">
        <Artwork tone="d" />
      </div>

      <div className="ui-left">
        <div className="gal__head">
          <div className="gal__h1">图库</div>
          <div className="gal__sub">2026 · 9月</div>
        </div>

        <div className="gal__grid">
          {SHOTS.map((t, i) => (
            <div key={t + i} className={i === 0 ? 'tile is-active' : 'tile'}>
              <Artwork tone={t} />
            </div>
          ))}
        </div>
      </div>

      <div className="ui-right">
        <div className="gal__meta">
          <div className="gal__h2">晨雾，外滩</div>
          <div className="gal__p">48MP ProRAW · f/1.78 · 1/240s · ISO 64</div>
        </div>

        <div className="gal__film">
          {SHOTS.slice(1, 6).map((t, i) => (
            <div key={t + i} className="tile">
              <Artwork tone={t} />
            </div>
          ))}
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}
