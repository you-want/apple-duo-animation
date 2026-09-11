import { CHAPTERS } from '../fold/mapping'
import { useReveal } from '../fold/hooks'

const CHANNELS = [
  {
    label: '铰链角度',
    from: '180°',
    to: '0°',
    note: '右半绕左边缘旋转，左半永远不动。两块面板尺寸恒定 —— 变的是空间关系，不是尺寸。',
    token: '--fold',
  },
  {
    label: '外屏',
    from: '面朝相机',
    to: '转到背面',
    note: '外屏就长在折叠那一半的背面。它随着面板一起转走，不需要任何淡出。',
    token: 'backface-visibility',
  },
  {
    label: '相机',
    from: '1.00 – 1.34 ×',
    to: '1.00 ×',
    note: '面积翻倍时轻微后拉，并让偏航角在中途达到峰值 —— 折面垂直于视线的那一刻才不会消失。起始倍率由舞台高度反推，所以窄屏上会自动收紧。',
    token: '--cam-s / --cam-ry',
  },
  {
    label: '内容布局',
    from: '单栏',
    to: '双栏',
    note: '封面元素的起点和终点写在同一个坐标空间里，于是它横跨折痕飞过去，而不是交叉淡入。',
    token: '--t',
  },
  {
    label: '折痕',
    from: '18px 转轴',
    to: '5px 暗线',
    note: '铰链的宽度和存在感一起衰减，只剩一道几乎看不见的折痕。折痕本身不是单调的：它只在玻璃真正被弯折时最深，展平后回落到一层很淡的残余。',
    token: '--t-spine / --t-crease',
  },
  {
    label: '运动模糊',
    from: '0px',
    to: '≤ 2.6px',
    note: '只糊内容层，不糊几何体。给带 3D 子元素的容器加 filter 会把整个场景压平。',
    token: '--blur',
  },
]

export function Mechanics() {
  const head = useReveal<HTMLDivElement>()
  const grid = useReveal<HTMLDivElement>()
  const stages = useReveal<HTMLDivElement>()

  return (
    <section className="section mechanics" id="mechanics">
      <div className="wrap">
        <header className="section__head reveal" ref={head}>
          <div className="eyebrow">Mechanics</div>
          <h2 className="section__title">六个通道，一条曲线。</h2>
          <p className="section__deck deck">
            每个视觉变化都绑定到同一个 0 → 1 的标量上。没有任何组件自己拥有动画状态 ——
            它们只是把同一个数字映射到不同的属性。
          </p>
        </header>

        <div className="mech">
          <div className="mech__scope reveal reveal--d1" ref={grid}>
            <div className="mech__scope-head">
              <span className="mono">progress</span>
              <span className="mono">0</span>
              <span className="mono">1</span>
            </div>
            {CHANNELS.map((c) => (
              <div className="chan" key={c.label}>
                <div className="chan__label">{c.label}</div>
                <div className="chan__track">
                  <span className="chan__from mono">{c.from}</span>
                  <span className="chan__line" aria-hidden>
                    <i />
                  </span>
                  <span className="chan__to mono">{c.to}</span>
                </div>
                <div className="chan__note">{c.note}</div>
                <code className="chan__token">{c.token}</code>
              </div>
            ))}
          </div>

          <aside className="mech__stages reveal reveal--d2" ref={stages}>
            <div className="mono mech__stages-title">progress → 阶段</div>
            {CHAPTERS.slice(1).map((c) => (
              <div className="stage-row" key={c.id}>
                <span className="stage-row__range mono">
                  {c.range[1].toFixed(2)} – {c.range[2].toFixed(2)}
                </span>
                <span className="stage-row__name">{c.title}</span>
                <span className="stage-row__tag mono">{c.tag.split(' · ')[1]}</span>
              </div>
            ))}
            <p className="mech__note">
              阶段之间没有 <code>if</code>，只有 <code>smoothstep</code>。所以拖动滑块时看不到任何跳变 ——
              这也是为什么它需要一条连续的曲线，而不是三个状态。
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
