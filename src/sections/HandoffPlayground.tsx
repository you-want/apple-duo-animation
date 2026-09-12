import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { clamp01, focusAt, writeFoldVars } from '../fold/mapping'
import { useDragProgress, useReveal, useStageSize } from '../fold/hooks'
import { FoldDevice } from '../fold/FoldDevice'
import { HomeCover } from '../fold/apps/HomeCover'
import { HomeSurface } from '../fold/apps/HomeSurface'

const PRESETS = [
  { label: '180° 外屏', value: 0 },
  { label: '141° 外屏转走', value: 0.38 },
  { label: '46° 内屏展开', value: 0.6 },
  { label: '0° 全清晰', value: 1 },
]

export function HandoffPlayground() {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  const { ref: stageRef, size } = useStageSize<HTMLDivElement>(0.78, 1.46)
  const [auto, setAuto] = useState(false)
  const reveal = useReveal<HTMLDivElement>()
  const revealShell = useReveal<HTMLDivElement>(0.05)

  const value = useRef(0)
  const tween = useRef<gsap.core.Tween | null>(null)
  const rangeRef = useRef<HTMLInputElement | null>(null)
  const pOut = useRef<HTMLSpanElement | null>(null)
  const foldOut = useRef<HTMLSpanElement | null>(null)
  const coverOut = useRef<HTMLSpanElement | null>(null)
  const leftBar = useRef<HTMLSpanElement | null>(null)
  const rightBar = useRef<HTMLSpanElement | null>(null)

  const apply = useCallback(
    (next: number) => {
      const scope = scopeRef.current
      if (!scope) return
      const v = clamp01(next)
      value.current = v
      const f = writeFoldVars(scope, v, size.current, 0, true)
      const fo = focusAt(v)

      if (rangeRef.current) rangeRef.current.value = v.toFixed(4)
      if (pOut.current) pOut.current.textContent = v.toFixed(3)
      if (foldOut.current) foldOut.current.textContent = `${f.fold.toFixed(1)}°`
      if (coverOut.current) coverOut.current.textContent = (1 - fo.out).toFixed(2)
      // Physical left leaf moves; right leaf remains sharp.
      if (leftBar.current) leftBar.current.style.width = `${(fo.a * 100).toFixed(1)}%`
      if (rightBar.current) rightBar.current.style.width = `${(fo.b * 100).toFixed(1)}%`
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
    const onResize = () => apply(value.current)
    const stage = stageRef.current
    stage?.addEventListener('fold:resize', onResize)
    window.addEventListener('resize', onResize)
    return () => {
      stage?.removeEventListener('fold:resize', onResize)
      window.removeEventListener('resize', onResize)
    }
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
    <section className="section playground" id="handoff-playground">
      <div className="wrap">
        <header className="section__head reveal" ref={reveal}>
          <div className="eyebrow">Playground</div>
          <h2 className="section__title">停在任意一帧，看两块屏如何交接。</h2>
          <p className="section__deck deck">
            右侧是照片图库，左侧是邮件草稿。展开时先露出图库，再看见左侧邮件；合上时按原路径回到外屏图库。拖动滑块或机身，观察内容怎样随面板交接。
          </p>
          <p className="section__deck deck">
            开合与双栏布局分别参考官网对应场景：<a href="https://www.apple.com/iphone-duo/" target="_blank" rel="noreferrer">Apple iPhone Duo</a>
            {' · '}<a href="https://www.apple.com/105/media/us/iphone-duo/2026/9305e4b9-72d9-4c05-9381-b572adadd5e5/anim/highlights-display/large.mp4" target="_blank" rel="noreferrer">开合动画参考 ↗</a>
            {' · '}<a href="https://www.apple.com/v/iphone-duo/a/images/overview/product-stories/versatility/apps_standby__b0akmv815b1e_large.jpg" target="_blank" rel="noreferrer">邮件＋图库布局 ↗</a>
          </p>
        </header>

        <div className="playground__shell reveal reveal--d1" ref={revealShell}>
          <div className="playground__stage fold-scope" ref={scopeRef} {...drag}>
            <div className="playground__stage-inner" ref={stageRef}>
              <FoldDevice
                hinge="left"
                cover={{ tone: 'a', title: 'Nightcall', artist: 'Kavinsky' }}
                coverNode={<HomeCover />}
              >
                <HomeSurface />
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
                aria-label="内外屏交接进度"
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
                      goTo(value.current > 0.5 ? 0 : 1, 3, true)
                    }
                  }}
                >
                  {auto ? '停止' : '自动往返'}
                </button>
              </div>
            </div>

            <div className="pg-block">
              <div className="pg-label mono">
                清晰度 · 左侧折面 / 右侧固定面
              </div>
              <div className="pg-focus">
                <div className="pg-focus__row">
                  <span className="pg-focus__name mono">左半</span>
                  <span className="pg-focus__track">
                    <i ref={leftBar} />
                  </span>
                </div>
                <div className="pg-focus__row">
                  <span className="pg-focus__name mono">右半</span>
                  <span className="pg-focus__track pg-focus__track--flip">
                    <i ref={rightBar} />
                  </span>
                </div>
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
                <span>cover sharp</span>
                <b ref={coverOut}>1.00</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
