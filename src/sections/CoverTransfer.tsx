import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { windowAt, writeFoldVars } from '../fold/mapping'
import { useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { TransferLayer } from '../fold/TransferLayer'
import { NowPlayingCover } from '../fold/apps/NowPlayingCover'
import { CoverFlowApp } from '../fold/apps/CoverFlowApp'
import { Artwork } from '../fold/ui/bits'

gsap.registerPlugin(ScrollTrigger)

const CHAPTERS = [
  {
    id: 'outer',
    index: '00',
    title: '外屏',
    body: '合上时，内容先落在朝向你的一侧 —— 外屏就长在折叠那一半的背面，所以你看到的是它，而不是被压在下面的内屏。',
    tag: 'cover display · 180°',
    range: [0, 0, 0.05, 0.11] as const,
  },
  {
    id: 'lift',
    index: '01',
    title: '脱开',
    body: '外屏那一半转走的时候，封面没有跟着转。它被提到机身之外，悬在原处 —— 面板从底下抽走，内容留在你眼前。',
    tag: 'hero lifted · 180° → 160°',
    range: [0.12, 0.2, 0.31, 0.39] as const,
  },
  {
    id: 'cross',
    index: '02',
    title: '横跨折痕',
    body: '它开始移动：从左半横跨折痕，飞向右侧详情面板的位置。同时轻微抬起、放大一点点，像真的被拿离了玻璃。',
    tag: 'hand-off · 160° → 12°',
    range: [0.41, 0.49, 0.63, 0.71] as const,
  },
  {
    id: 'land',
    index: '03',
    title: '落位',
    body: '封面落到右半，内屏随之成形。两个元素在同一坐标上交接，所以你看不到任何切换 —— 从外屏到内屏，始终是同一张封面。',
    tag: 'landed · 0°',
    range: [0.8, 0.88, 1.4, 1.5] as const,
  },
]

/**
 * The centrepiece of the hand-off study: one pinned scene, one scalar, and a
 * shared element that survives the fold.
 */
export function CoverTransfer() {
  const scopeRef = useRef<HTMLElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>()
  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const flyOut = useRef<HTMLSpanElement | null>(null)
  const modeOut = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    let blur = 0
    let writtenBlur = -1
    let curFold = 180
    const blurTargets = Array.from(
      scope.querySelectorAll<HTMLElement>('.panel__screen-inner, .panel__outer-inner'),
    )

    const apply = (p: number) => {
      const f = writeFoldVars(scope, p, size.current, blur)
      curFold = f.fold

      CHAPTERS.forEach((c, i) => {
        const [a, b, cc, d] = c.range
        const o = windowAt(p, a, b, cc, d)
        scope.style.setProperty(`--ch${i}`, o.toFixed(4))
        scope.style.setProperty(`--cy${i}`, `${((1 - o) * 20).toFixed(2)}px`)
      })

      if (pOut.current) pOut.current.textContent = p.toFixed(3)
      if (foldOut.current) foldOut.current.textContent = `${f.fold.toFixed(1)}°`
      if (flyOut.current) flyOut.current.textContent = f.flyT.toFixed(3)
      if (modeOut.current) {
        modeOut.current.textContent =
          p < 0.1 ? 'on cover' : p < 0.32 ? 'lifted' : p < 0.8 ? 'in flight' : 'handed off'
      }
    }

    let prev = 180
    const tick = () => {
      const v = Math.abs(curFold - prev)
      prev = curFold
      blur += (Math.min(v * 0.82, 2.6) - blur) * 0.3
      if (Math.abs(blur - writtenBlur) > 0.02) {
        writtenBlur = blur
        const filter = blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : ''
        blurTargets.forEach((el) => {
          el.style.filter = filter
        })
      }
    }
    gsap.ticker.add(tick)

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
      gsap.ticker.remove(tick)
      ctx.revert()
    }
  }, [size])

  return (
    <section className="narrative fold-scope" ref={scopeRef} id="cover">
      <div className="narrative__stage" ref={stageRef}>
        <FoldDevice
          cover={{ tone: 'a', title: 'Nightcall', artist: 'Kavinsky' }}
          coverNode={<NowPlayingCover />}
          flight={
            <TransferLayer>
              <Artwork tone="a" disc />
            </TransferLayer>
          }
        >
          <CoverFlowApp />
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
            style={{ opacity: `calc(0.2 + var(--ch${i}) * 0.8)`, width: `calc(10px + var(--ch${i}) * 18px)` }}
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
          <span>hand-off</span>
          <b ref={flyOut}>0.000</b>
        </div>
        <div className="hud__row">
          <span>state</span>
          <b ref={modeOut}>on cover</b>
        </div>
      </div>

      <div className="narrative__hint" style={{ opacity: 'calc(var(--ch0) * 0.85)' }}>
        <span className="mono">向下滚动</span>
        <span className="narrative__hint-arrow" aria-hidden />
      </div>
    </section>
  )
}
