import { FoldDevice } from '../fold/FoldDevice'
import { FoldScene } from '../fold/FoldScene'
import { AppSurface } from '../fold/apps'
import { useReveal } from '../fold/hooks'

const STOPS = [
  { p: 0, angle: '180°', name: '合上', note: '外屏 · 单栏' },
  { p: 0.34, angle: '128°', name: '微开', note: '折面入画' },
  { p: 0.66, angle: '52°', name: '半开', note: '内容重排中' },
  { p: 1, angle: '0°', name: '展开', note: '双栏 · 同一画布' },
]

export function States() {
  const head = useReveal<HTMLDivElement>()
  const grid = useReveal<HTMLDivElement>()

  return (
    <section className="section states" id="states">
      <div className="wrap">
        <header className="section__head reveal" ref={head}>
          <div className="eyebrow">Keyframes</div>
          <h2 className="section__title">四个定点。</h2>
          <p className="section__deck deck">
            把曲线拆成静帧看，会更容易发现一件事：两块屏幕的尺寸从头到尾没有变过。变的只是它们之间的角度，
            以及内容如何分配这些空间。
          </p>
        </header>

        <div className="states__grid reveal reveal--d1" ref={grid}>
          {STOPS.map((s) => (
            <figure className="stop" key={s.angle}>
              <FoldScene progress={s.p} className="stop__stage" density={0.7}>
                <FoldDevice cover={{ tone: 'a', title: 'Nightcall', artist: 'Kavinsky' }}>
                  <AppSurface app="player" />
                </FoldDevice>
              </FoldScene>
              <figcaption className="stop__cap">
                <div className="stop__angle mono">{s.angle}</div>
                <div className="stop__name">{s.name}</div>
                <div className="stop__note">{s.note}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
