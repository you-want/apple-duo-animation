import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { focusAt, windowAt, writeFoldVars } from '../fold/mapping'
import { useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { HomeCover } from '../fold/apps/HomeCover'
import { HomeSurface } from '../fold/apps/HomeSurface'

gsap.registerPlugin(ScrollTrigger)

const CHAPTERS = [
  {
    id: 'outer',
    index: '00',
    title: '两块屏，背靠背',
    body: '合上时朝向你的是外屏。它和「会转动的那一半内屏」共用同一块玻璃的两个面 —— 所以交接不需要搬运内容，只需要把焦点交过去。',
    tag: 'cover display · 180°',
    range: [0, 0, 0.05, 0.11] as const,
  },
  {
    id: 'defocus',
    index: '01',
    title: '散焦',
    body: '机身开始展开。外屏不是淡出，是失焦：它仍然在，只是不再锐利。等它转到背面时，已经没有一块清晰的像素需要被藏起来。',
    tag: 'defocus · 180° → 120°',
    range: [0.12, 0.2, 0.3, 0.38] as const,
  },
  {
    id: 'sweep',
    index: '02',
    title: '从铰链向外对焦',
    body: '内屏露出来的部分带着一层模糊。清晰区从铰链开始生长 —— 因为玻璃是绕着铰链转的，边缘走得最远，也就最晚对上焦。',
    tag: 'focus sweep · 120° → 20°',
    range: [0.4, 0.48, 0.62, 0.7] as const,
  },
  {
    id: 'open',
    index: '03',
    title: '同一张画面',
    body: '0° 时两边都清楚了。外屏上那组 widget 就是内屏左半的那组 widget —— 位置没变、内容没变，变的是它现在有两块面板的宽度可以铺开。',
    tag: 'in focus · 0°',
    range: [0.76, 0.84, 1.4, 1.5] as const,
  },
]

/**
 * Study 03. Same engine as the other two scenes, but the channel that matters
 * is sharpness rather than position: the cover display defocuses on its way
 * out, and each half of the inner display pulls focus on its own schedule.
 */
export function HandoffTransfer() {
  const scopeRef = useRef<HTMLElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>()
  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const focusOut = useRef<HTMLSpanElement | null>(null)
  const modeOut = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const apply = (p: number) => {
      // Motion blur is deliberately off: this scene's blur is the subject, and
      // two kinds of blur on the same glass would read as a smudge.
      const f = writeFoldVars(scope, p, size.current, 0)
      const fo = focusAt(p)

      CHAPTERS.forEach((c, i) => {
        const [a, b, cc, d] = c.range
        const o = windowAt(p, a, b, cc, d)
        scope.style.setProperty(`--ch${i}`, o.toFixed(4))
        scope.style.setProperty(`--cy${i}`, `${((1 - o) * 20).toFixed(2)}px`)
      })

      if (pOut.current) pOut.current.textContent = p.toFixed(3)
      if (foldOut.current) foldOut.current.textContent = `${f.fold.toFixed(1)}°`
      if (focusOut.current) {
        focusOut.current.textContent = `${fo.out.toFixed(2)} · ${fo.a.toFixed(2)} · ${fo.b.toFixed(2)}`
      }
      if (modeOut.current) {
        modeOut.current.textContent =
          p < 0.06 ? 'cover, sharp' : p < 0.34 ? 'cover, defocusing' : p < 0.9 ? 'pull focus' : 'in focus'
      }
    }

    const state = { p: 0 }
    const onResize = () => apply(state.p)
    window.addEventListener('resize', onResize)

    const ctx = gsap.context(() => {
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => apply(state.p),
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, scope)

    apply(0)
    ScrollTrigger.refresh()

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [size])

  return (
    <section className="narrative fold-scope" ref={scopeRef} id="handoff">
      <div className="narrative__stage" ref={stageRef}>
        <FoldDevice float cover={{ tone: 'a', title: 'Nightcall', artist: 'Kavinsky' }} coverNode={<HomeCover />}>
          <HomeSurface />
        </FoldDevice>
      </div>

      <div className="narrative__copy">
        {CHAPTERS.map((c, i) => (
          <article
            className="chapter"
            key={c.id}
            style={{ opacity: `var(--ch${i})`, transform: `translateY(var(--cy${i}))` }}
          >
            <div className="chapter__index mono">{c.index}</div>
            <h2 className={i === 0 ? 'chapter__title chapter__title--lead' : 'chapter__title'}>
              {c.title}
            </h2>
            <p className="chapter__body deck">{c.body}</p>
            <div className="chapter__tag mono">{c.tag}</div>
          </article>
        ))}
      </div>

      <div className="narrative__rail" aria-hidden>
        {CHAPTERS.map((c, i) => (
          <span
            className="rail__tick"
            key={c.id}
            style={{
              opacity: `calc(0.2 + var(--ch${i}) * 0.8)`,
              width: `calc(10px + var(--ch${i}) * 18px)`,
            }}
          />
        ))}
      </div>

      <div className="hud">
        <div className="hud__row">
          <span>progress</span>
          <b ref={pOut}>0.000</b>
        </div>
        <div className="hud__row">
          <span>hinge</span>
          <b ref={foldOut}>180.0°</b>
        </div>
        <div className="hud__row">
          <span>focus out · a · b</span>
          <b ref={focusOut}>0.00 · 0.00 · 0.00</b>
        </div>
        <div className="hud__row">
          <span>hand-off</span>
          <b ref={modeOut}>cover, sharp</b>
        </div>
      </div>

      <div className="narrative__hint" style={{ opacity: 'calc(var(--ch0) * 0.85)' }}>
        <span className="mono">向下滚动</span>
        <span className="narrative__hint-arrow" aria-hidden />
      </div>
    </section>
  )
}
