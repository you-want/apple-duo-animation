import { Artwork, StatusBar } from '../ui/bits'

interface IconDef {
  name: string
  tone: string
  glyph: string
}

const ICONS: IconDef[] = [
  { name: 'FaceTime', tone: 'green', glyph: 'video' },
  { name: '日历', tone: 'red', glyph: 'bar' },
  { name: 'App Store', tone: 'blue', glyph: 'tri' },
  { name: '相机', tone: 'slate', glyph: 'ring' },
  { name: '邮件', tone: 'sky', glyph: 'tri' },
  { name: '备忘录', tone: 'amber', glyph: 'bar' },
  { name: '音乐', tone: 'pink', glyph: 'cross' },
  { name: '地图', tone: 'mint', glyph: 'ring' },
  { name: '新闻', tone: 'rose', glyph: 'cross' },
  { name: 'TV', tone: 'ink', glyph: 'video' },
  { name: '游戏', tone: 'violet', glyph: 'dot' },
  { name: '照片', tone: 'rainbow', glyph: 'ring' },
]

const DOCK: IconDef[] = [
  { name: '', tone: 'sky', glyph: 'dot' },
  { name: '', tone: 'green', glyph: 'video' },
  { name: '', tone: 'amber', glyph: 'bar' },
  { name: '', tone: 'violet', glyph: 'dot' },
]

/** One app tile. Everything about it is a gradient plus one abstract glyph. */
function Icon({ icon }: { icon: IconDef }) {
  return (
    <div className="hs__icon">
      <span className={`hi hi--${icon.tone} hi--${icon.glyph}`} aria-hidden />
      {icon.name ? <span className="hs__icon-label">{icon.name}</span> : null}
    </div>
  )
}

/**
 * The widget stack — the one piece of layout that is *literally shared*.
 *
 * It is dropped in twice: once inside the cover display, and once in the left
 * half of the inner canvas, which is the half sitting back-to-back with the
 * cover. The two are never visible at the same time (the panel is between
 * them), but they occupy the same coordinates, so when the device opens what
 * the eye sees is the same picture — only the focus has changed.
 */
export function WidgetStack() {
  return (
    <div className="hw">
      <div className="hw__np">
        <div className="hw__art">
          <Artwork tone="c" />
        </div>
        <div className="hw__npmeta">
          <span className="hw__eyebrow">Up next</span>
          <strong>Nightcall</strong>
          <span>Kavinsky · 3:58</span>
        </div>
        <div className="hw__bar" aria-hidden>
          <i />
        </div>
      </div>

      <div className="hw__agenda">
        <div className="hw__agenda-head">
          <span>10月9日 周三</span>
          <b>3</b>
        </div>
        <div className="hw__row">
          <b>10:30</b>
          <span>设计评审</span>
        </div>
        <div className="hw__row">
          <b>14:00</b>
          <span>与 Apple 同步</span>
        </div>
        <div className="hw__row">
          <b>17:30</b>
          <span>去健身房</span>
        </div>
      </div>
    </div>
  )
}

/** Everything the inner canvas draws, on both halves, in device coordinates. */
function HomeBody() {
  return (
    <>
      <StatusBar />

      {/* ---- left half: the cover display's own layout ---- */}
      <div className="hs__col hs__col--a">
        <WidgetStack />
      </div>

      {/* ---- right half: where that layout grows into a full screen ---- */}
      <div className="hs__col hs__col--b">
        <div className="hs__widgets">
          <div className="hs__w hs__w--weather">
            <span className="hw__eyebrow">San Francisco</span>
            <strong>54°</strong>
            <span>多云 · 51°–58°</span>
          </div>
          <div className="hs__w hs__w--map">
            <span className="hw__eyebrow">Channel</span>
            <i aria-hidden />
          </div>
        </div>

        <div className="hs__grid">
          {ICONS.map((i) => (
            <Icon key={i.name} icon={i} />
          ))}
        </div>

        <div className="hs__dock">
          {DOCK.map((d, i) => (
            <Icon key={i} icon={d} />
          ))}
        </div>
      </div>
    </>
  )
}

/**
 * Inner display for the focus study.
 *
 * Two stacked copies of the same screen. The lower one is sharp; the upper one
 * is the same markup again, blurred and masked into a band that retreats
 * toward the hinge. Which scalar drives the retreat depends on which panel the
 * copy ended up in — that is decided in CSS, not here, so this component stays
 * a pure function of the fold.
 */
export function HomeSurface() {
  return (
    <div className="hs">
      <HomeBody />

      <div className="hs__band" aria-hidden>
        <div className="hs__band-body">
          <HomeBody />
        </div>
      </div>
    </div>
  )
}
