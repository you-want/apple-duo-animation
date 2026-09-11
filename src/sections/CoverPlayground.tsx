import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { clamp01, writeFoldVars } from '../fold/mapping'
import { useDragProgress, useReveal, useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { TransferLayer } from '../fold/TransferLayer'
import { NowPlayingCover } from '../fold/apps/NowPlayingCover'
import { CoverFlowApp } from '../fold/apps/CoverFlowApp'
import { Artwork } from '../fold/ui/bits'

const PRESETS = [
  { label: '180° 外屏', value: 0 },
  { label: '120° 脱开', value: 0.28 },
  { label: '90° 飞行中', value: 0.5 },
  { label: '0° 落位', value: 1 },
]

/** Park the hand-off at any angle and scrub through it by hand. */
export function CoverPlayground() {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>()
  const [auto, setAuto] = useState(false)
  const reveal = useReveal<HTMLDivElement>()
  const revealShell = useReveal<HTMLDivElement>(0.05)

  const value = useRef(0)
  const tween = useRef<gsap.core.Tween | null>(null)
  const rangeRef = useRef<HTMLInputElement | null>(null)
  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const flyOut = useRef<HTMLSpanElement | null>(null)

  const apply = useCallback(
    (next: number) => {
      const scope = scopeRef.current
      if (!scope) return
      const v = clamp01(next)
      value.current = v
      const f = writeFoldVars(scope, v, size.current, 0)
      if (rangeRef.current) rangeRef.current.value = v.toFixed(4)
      if (pOut.current) pOut.current.textContent = v.toFixed(3)
      if (foldOut.current) foldOut.current.textContent = `${f.fold.toFixed(1)}°`
      if (flyOut.current) flyOut.current.textContent = f.flyT.toFixed(3)
    },
    [size],
  )

  const stop = useCallback(() => {
    tween.current?.kill()
    tween.current = null
    setAuto(false)
  }, [])

  const goTo = useCallback(
    (target: number, duration = 1.15, yoyo = false) => {
      if (!scopeRef.current) return
      tween.current?.kill()
      if (!yoyo) setAuto(false)
      const state = { p: value.current }
      tween.current = gsap.to(state, {
        p: target,
        duration,
        ease: 'power3.inOut',
        yoyo,
        repeat: yoyo ? -1 : 0,
        onUpdate: () => apply(state.p),
        onComplete: () => {
          if (!yoyo) tween.current = null
        },
      })
    },
    [apply],
  )

  useLayoutEffect(() => {
    apply(value.current)
    // Panel size is measured in px, so the endpoints have to be recomputed
    // whenever the stage changes shape.
    const onResize = () => apply(value.current)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [apply])

  useLayoutEffect(
    () => () => {
      tween.current?.kill()
    },
    [],
  )

  const drag = useDragProgress(
    useCallback(
      (_dx: number, dy: number) => {
        stop()
        apply(value.current - dy * 0.0045)
      },
      [apply, stop],
    ),
  )

  return (
    <section className="section playground" id="cover-playground">
      <div className="wrap">
        <header className="section__head reveal" ref={reveal}>
          <div className="eyebrow">Playground</div>
          <h2 className="section__title">停在任意一帧，看它怎么交接。</h2>
          <p className="section__deck deck">
            慢下来才看得清：封面先在外屏停住，面板从底下转走，然后它才横跨折痕落到右半。
            拖动滑块，或者直接在手机上拖动机身。
          </p>
        </header>

        <div className="playground__shell reveal reveal--d1" ref={revealShell}>
          <div className="playground__stage fold-scope" ref={scopeRef} {...drag}>
            <div className="playground__stage-inner" ref={stageRef}>
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
            <div className="playground__drag mono">拖动机身 · 上下</div>
          </div>

          <div className="playground__panel">
            <div className="pg-block">
              <div className="pg-label mono">
                开合 <span className="pg-label__val">0.000 → 1.000</span>
              </div>
              <input
                ref={rangeRef}
                className="pg-range"
                type="range"
                min={0}
                max={1}
                step={0.001}
                defaultValue={0}
                aria-label="外屏到内屏的交接进度"
                onChange={(e) => {
                  stop()
                  apply(e.currentTarget.valueAsNumber)
                }}
              />
            </div>

            <div className="pg-block">
              <div className="pg-label mono">关键帧</div>
              <div className="pg-presets">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" className="chip" onClick={() => goTo(p.value)}>
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={auto ? 'chip chip--accent' : 'chip'}
                  onClick={() => {
                    if (auto) stop()
                    else {
                      setAuto(true)
                      goTo(value.current > 0.5 ? 0 : 1, 2.6, true)
                    }
                  }}
                >
                  {auto ? '停止' : '自动往返'}
                </button>
              </div>
            </div>

            <div className="pg-block pg-readout">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
