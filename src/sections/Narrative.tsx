import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS, windowAt, writeFoldVars } from '../fold/mapping'
import { useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { AppSurface, appMeta } from '../fold/apps'
import type { AppId } from '../fold/apps'

gsap.registerPlugin(ScrollTrigger)

/**
 * The centrepiece: one pinned scene, one scalar, four chapters.
 * Scroll position → `state.p` → every channel in the scene.
 */
export function Narrative() {
  const scopeRef = useRef<HTMLElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>()

  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const modeOut = useRef<HTMLSpanElement | null>(null)
  const camOut = useRef<HTMLSpanElement | null>(null)

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
      if (camOut.current) camOut.current.textContent = `${f.camS.toFixed(3)} · ${f.camRy.toFixed(1)}°`
      if (modeOut.current) {
        modeOut.current.textContent =
          p < 0.1 ? 'cover' : p < 0.34 ? 'unfolding' : p < 0.74 ? 'reflowing' : 'dual-pane'
      }
    }

    let prev = 180
    const tick = () => {
      const v = Math.abs(curFold - prev)
      prev = curFold
      const target = Math.min(v * 0.82, 2.6)
      blur += (target - blur) * 0.3
      if (Math.abs(blur - writtenBlur) > 0.02) {
        writtenBlur = blur
        const px = Math.max(blur, 0)
        scope.style.setProperty('--blur', `${px.toFixed(2)}px`)
        const filter = px > 0.08 ? `blur(${px.toFixed(2)}px)` : ''
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
          end: () => `+=${Math.round(window.innerHeight * 2.9)}`,
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

  const app: AppId = 'player'
  const meta = appMeta(app)

  return (
    <section className="narrative fold-scope" ref={scopeRef} id="top">
      <div className="narrative__stage" ref={stageRef}>
        <FoldDevice float cover={meta.cover}>
          <AppSurface app={app} />
        </FoldDevice>
      </div>

      <div className="narrative__copy">
        {CHAPTERS.map((c, i) => (
          <article
            className="chapter"
            key={c.id}
            style={{
              opacity: `var(--ch${i})`,
              transform: `translateY(var(--cy${i}))`,
            }}
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
          <span>camera</span>
          <b ref={camOut}>1.040 · 0.0°</b>
        </div>
        <div className="hud__row">
          <span>layout</span>
          <b ref={modeOut}>cover</b>
        </div>
      </div>

      <div className="narrative__hint" style={{ opacity: 'calc(var(--ch0) * 0.85)' }}>
        <span className="mono">向下滚动</span>
        <span className="narrative__hint-arrow" aria-hidden />
      </div>
    </section>
  )
}
