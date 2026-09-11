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

export function PlayerApp() {
  return (
    <div className="ui-root ui-root--player">
      <StatusBar />

      {/* One element, authored in device space: full-bleed on the left half at
          rest, landing as the detail pane's artwork on the right half. */}
      <div className="ui-hero">
        <Artwork tone="a" disc />
      </div>

      <div className="ui-left">
        <div className="lhero">
          <div className="lhero__title">Nightcall</div>
          <div className="lhero__artist">Kavinsky · OutRun</div>
          <div className="scrub">
            <div className="scrub__fill" style={{ width: '38%' }} />
          </div>
          <div className="scrub__times">
            <span>1:38</span>
            <span>-2:41</span>
          </div>
          <div className="controls">
            <span className="controls__skip" aria-hidden />
            <span className="controls__play" aria-hidden />
            <span className="controls__skip controls__skip--next" aria-hidden />
          </div>
        </div>

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
