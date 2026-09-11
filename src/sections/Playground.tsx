import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { clamp01, writeFoldVars } from '../fold/mapping'
import { useDragProgress, useReveal, useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { APPS, AppSurface, appMeta } from '../fold/apps'
import type { AppId } from '../fold/apps'

/** Manual scrub. Same scalar as the scroll scene, different input device. */
export function Playground() {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>()
  const [app, setApp] = useState<AppId>('player')
  const [auto, setAuto] = useState(false)
  const reveal = useReveal<HTMLDivElement>()
  const revealShell = useReveal<HTMLDivElement>(0.05)

  const value = useRef(0.5)
  const tween = useRef<gsap.core.Tween | null>(null)
  const rangeRef = useRef<HTMLInputElement | null>(null)
  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const camOut = useRef<HTMLSpanElement | null>(null)
  const layoutOut = useRef<HTMLSpanElement | null>(null)

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
      if (camOut.current) camOut.current.textContent = f.camS.toFixed(3)
      if (layoutOut.current) {
        layoutOut.current.textContent =
          v < 0.16 ? 'cover' : v < 0.46 ? 'unfolding' : v < 0.8 ? 'reflowing' : 'dual-pane'
      }
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
      const scope = scopeRef.current
      if (!scope) return
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
    // Panel size is measured in px, so the camera offset has to be recomputed
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

  const meta = appMeta(app)

  return (
    <section className="section playground" id="playground">
      <div className="wrap">
        <header className="section__head reveal" ref={reveal}>
          <div className="eyebrow">Playground</div>
          <h2 className="section__title">同一个变量，换一个输入设备。</h2>
          <p className="section__deck deck">
            下面这台机器的开合角度由你控制。拖动滑块、在手机上直接上下拖拽机身，或者按预设跳转 ——
            铰链、相机、内容布局和折痕会同时跟上。
          </p>
        </header>

        <div className="playground__shell reveal reveal--d1" ref={revealShell}>
          <div className="playground__stage fold-scope" ref={scopeRef} {...drag}>
            <div className="playground__stage-inner" ref={stageRef}>
              <FoldDevice cover={meta.cover}>
                <AppSurface app={app} />
              </FoldDevice>
            </div>
            <div className="playground__drag mono">拖动机身 · 上下</div>
          </div>

          <div className="playground__panel">
            <div className="pg-block">
              <div className="pg-label mono">应用</div>
              <div className="pg-tabs">
                {APPS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={a.id === app ? 'chip is-on' : 'chip'}
                    onClick={() => {
                      setApp(a.id)
                    }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              <p className="pg-hint">{meta.hint}</p>
            </div>

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
                defaultValue={0.5}
                aria-label="折叠进度"
                onChange={(e) => {
                  stop()
                  apply(e.currentTarget.valueAsNumber)
                }}
              />
              <div className="pg-presets">
                <button type="button" className="chip" onClick={() => goTo(0)}>
                  180° 合上
                </button>
                <button type="button" className="chip" onClick={() => goTo(0.5)}>
                  90° 半开
                </button>
                <button type="button" className="chip" onClick={() => goTo(1)}>
                  0° 展开
                </button>
                <button
                  type="button"
                  className={auto ? 'chip chip--accent' : 'chip'}
                  onClick={() => {
                    if (auto) {
                      stop()
                    } else {
                      setAuto(true)
                      goTo(value.current > 0.5 ? 0 : 1, 2.3, true)
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
                <b ref={pOut}>0.500</b>
              </div>
              <div className="hud__row">
                <span>hinge</span>
                <b ref={foldOut}>90.0°</b>
              </div>
              <div className="hud__row">
                <span>camera.scale</span>
                <b ref={camOut}>1.020</b>
              </div>
              <div className="hud__row">
                <span>layout</span>
                <b ref={layoutOut}>reflowing</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
