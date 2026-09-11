import { Artwork, HomeIndicator, StatusBar } from '../ui/bits'
import type { Tone } from '../ui/bits'

const TRACKS: { title: string; artist: string; dur: string; tone: Tone }[] = [
  { title: 'Nightcall', artist: 'Kavinsky', dur: '4:19', tone: 'a' },
  { title: 'Midnight City', artist: 'M83', dur: '4:03', tone: 'b' },
  { title: 'Blade Runner', artist: 'Vangelis', dur: '5:46', tone: 'c' },
  { title: 'A Real Hero', artist: 'College', dur: '4:27', tone: 'd' },
  { title: 'Sunset Drive', artist: 'Home', dur: '3:51', tone: 'e' },
  { title: 'Odessa', artist: 'Caribou', dur: '5:12', tone: 'f' },
]

const QUEUE = [
  { name: 'Midnight City', dur: '4:03' },
  { name: 'A Real Hero', dur: '4:27' },
  { name: 'Sunset Drive', dur: '3:51' },
  { name: 'Odessa', dur: '5:12' },
]

const WAVE = [0.42, 0.7, 0.34, 0.88, 0.55, 0.96, 0.4, 0.76, 0.3, 0.62, 0.9, 0.48, 0.72, 0.36, 0.84, 0.52, 0.68, 0.32, 0.94, 0.44, 0.6, 0.8, 0.38, 0.66]

/**
 * Inner display for the hand-off study.
 *
 * Unlike the main study's PlayerApp, there is no morphing hero here: the
 * artwork is owned by the flight layer for the whole sweep. This layout only
 * renders its *destination* — parked at the exact rect the flight lands on
 * (`--fly-x1/y1/w1`), and invisible until the hand-off at the very end. That
 * way the art is a single element the entire time, instead of two that have to
 * be kept in sync.
 */
export function CoverFlowApp() {
  return (
    <div className="ui-root ui-root--player cf-root">
      <StatusBar />

      <div className="ui-left">
        <div className="llist">
          <div className="llist__head">
            <div className="llist__title">正在播放</div>
            <div className="llist__hint">全部 24 首</div>
          </div>
          <div className="llist__rows">
            {TRACKS.map((t, i) => (
              <div key={t.title} className={i === 0 ? 'row is-active' : 'row'}>
                <div className="row__art">
                  <Artwork tone={t.tone} />
                </div>
                <div className="row__meta">
                  <div className="row__title">{t.title}</div>
                  <div className="row__sub">{t.artist}</div>
                </div>
                <div className="row__dur">{t.dur}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ui-right">
        {/* The flight layer's landing pad. Same coordinates, so the hand-off is
            a no-op the eye cannot catch. */}
        <div className="cf-hero">
          <Artwork tone="a" disc />
        </div>

        <div className="detail">
          <div className="detail__eyebrow">正在播放</div>
        </div>

        <div className="detail__body">
          <div className="detail__title">Nightcall</div>
          <div className="detail__artist">Kavinsky · OutRun · 2011</div>
          <div className="wave" aria-hidden>
            {WAVE.map((h, i) => (
              <i key={i} style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.09}s` }} />
            ))}
          </div>
        </div>

        <div className="queue">
          <div className="queue__head">
            <div className="t-eyebrow">接下来</div>
            <div className="t-eyebrow">4 首</div>
          </div>
          {QUEUE.map((q, i) => (
            <div key={q.name} className="qrow">
              <span className="qrow__idx">{i + 1}</span>
              <span className="qrow__name">{q.name}</span>
              <span className="qrow__dur">{q.dur}</span>
            </div>
          ))}
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}
