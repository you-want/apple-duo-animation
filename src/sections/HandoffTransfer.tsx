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
    title: '合上，继续看照片',
    body: '外屏是一页正在浏览的图库。展开后，图库延续到右侧内屏，左侧多出一封正在编辑的邮件。',
    tag: 'cover display · 180°',
    range: [0, 0, 0.05, 0.11] as const,
  },
  {
    id: 'defocus',
    index: '01',
    title: '外屏随折面转走',
    body: '左侧折面绕铰链打开，外屏随之转向背面。内容保留在玻璃上，右侧内屏从后方逐渐露出。',
    tag: 'defocus · 180° → 120°',
    range: [0.12, 0.2, 0.3, 0.38] as const,
  },
  {
    id: 'sweep',
    index: '02',
    title: '右侧先清晰，左侧后到位',
    body: '右侧图库先从外屏后方露出，左侧邮件随折面转过来。内容留在各自面板内，柔焦区域随展开逐渐退向左边缘。',
    tag: 'focus sweep · 120° → 20°',
    range: [0.4, 0.48, 0.62, 0.7] as const,
  },
  {
    id: 'open',
    index: '03',
    title: '左边写邮件，右边选照片',
    body: '两边是不同的应用：左侧保留邮件草稿，右侧展示照片图库。选中的照片与邮件附件相同，参考官网 Split View 的并排布局。',
    tag: 'in focus · 0°',
    range: [0.76, 0.84, 1.4, 1.5] as const,
  },
]

export function HandoffTransfer() {
  const scopeRef = useRef<HTMLElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>(0.78, 1.46)
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
      const f = writeFoldVars(scope, p, size.current, 0, true)
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
          p < 0.28 ? 'cover, sharp' : p < 0.5 ? 'cover turning' : p < 0.9 ? 'left settling' : 'in focus'
      }
    }

    const state = { p: 0 }
    const onResize = () => apply(state.p)
    const stage = stageRef.current
    stage?.addEventListener('fold:resize', onResize)
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
      stage?.removeEventListener('fold:resize', onResize)
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [size])

  return (
    <section className="narrative fold-scope" ref={scopeRef} id="handoff">
      <div className="narrative__stage" ref={stageRef}>
        <FoldDevice hinge="left" cover={{ tone: 'a', title: 'Nightcall', artist: 'Kavinsky' }} coverNode={<HomeCover />}>
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
          <span>blur out · sharp L · R</span>
          <b ref={focusOut}>0.00 · 0.00 · 1.00</b>
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
