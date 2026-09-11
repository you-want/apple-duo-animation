const STACK = [
  { k: '几何', v: '两块刚性面板 + CSS 3D rotateY' },
  { k: '驱动', v: '单一 progress → CSS 自定义属性' },
  { k: '滚动', v: 'GSAP ScrollTrigger · pin + scrub' },
  { k: '内容', v: '2×panel 宽的同一块画布，逐半裁切' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__lead">
            <div className="eyebrow">Under the hood</div>
            <h3 className="footer__title">没有 3D 模型，只有四个决定。</h3>
            <p className="deck footer__deck">
              手机是纯 DOM：两块固定尺寸的平面，绕一条铰链转。第一版不需要 Three.js ——
              CSS 3D 已经足够做出九成的观感，而 UI 留在 DOM 里才好维护。
            </p>
          </div>
          <dl className="footer__stack">
            {STACK.map((s) => (
              <div className="stack-row" key={s.k}>
                <dt className="mono">{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="footer__bottom">
          <span className="mono">Fold UI · iPhone Duo animation study</span>
          <span className="mono">React · GSAP · CSS 3D</span>
        </div>
      </div>
    </footer>
  )
}
