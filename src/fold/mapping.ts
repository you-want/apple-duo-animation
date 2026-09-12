/**
 * Fold engine.
 *
 * Everything on screen is derived from a single scalar: `p` (0 = closed, 1 = open).
 * No component owns its own animation state — they all read the same channel.
 */

/** Panel aspect (each half of the device). Matches a ~2.06:1 phone. */
export const PANEL_RATIO = 2.06

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const mapRange = (a: number, b: number, c: number, d: number, v: number) =>
  b === a ? c : lerp(c, d, clamp01((v - a) / (b - a)))

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function smoothstep(edge0: number, edge1: number, x: number) {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** A trapezoid window: rises over [a,b], holds, falls over [c,d]. */
export function windowAt(p: number, a: number, b: number, c: number, d: number) {
  return smoothstep(a, b, p) * (1 - smoothstep(c, d, p))
}

/**
 * Crease strength.
 *
 * The crease is the one channel that is *not* monotonic in `p`. It exists only
 * because the glass is bent, so it should peak while the device is actually
 * folded and relax back to a faint residual once the two halves lie flat.
 * Leaving it pinned at 1 (the first instinct) paints a 40px dark band straight
 * through the UI at 0° — which is exactly what the chapter copy calls "an
 * almost invisible crease".
 */
export function creaseAt(p: number) {
  const bent = windowAt(p, 0.02, 0.27, 0.58, 0.95)
  const residual = 0.015 * smoothstep(0, 0.28, p)
  return clamp01(residual + 0.64 * bent)
}

/** Focus estimates from Apple's highlights-display film; see docs/duo-reference.md.
 * a = moving panel, b = fixed panel. No claim of an OS-level focus effect.
 */
export const DEFOCUS = 0.035
export interface FocusFrame { out: number; a: number; b: number }
export function focusAt(p: number): FocusFrame {
  const t = clamp01(p)
  return {
    out: smoothstep(0.28, 0.57, t),
    a: smoothstep(0.43, 0.9, t),
    b: 1,
  }
}

/* ==========================================================================
   Cover → inner hand-off
   --------------------------------------------------------------------------
   The outer display sits on the *back* of the folding half, so as the device
   opens it physically rotates away from the viewer. Left alone, its content
   just leaves. To keep the content instead, one element is lifted out of the
   panel and parked in camera space: it holds at the cover's position while the
   panel swings out from underneath it, then travels across the hinge and lands
   as the inner display's detail pane.
   ========================================================================== */

/** Where the hero sits on the cover display, as fractions of its inner box. */
export const COVER_ART = { cx: 0.5, cy: 0.46, w: 0.6 }
/** Where it lands, x/y/w as multiples of `panelW` (matches `.ui-hero` at t=1). */
export const DETAIL_ART = { x: 1.152, y: 0.287, w: 0.653 }
/** The cover display is inset this far inside the folding panel. */
export const COVER_INSET = 9

export interface FlightGeometry {
  /** centre + width while it still reads as part of the cover (device px) */
  x0: number
  y0: number
  w0: number
  /** centre + width once it has landed in the inner display */
  x1: number
  y1: number
  w1: number
}

/**
 * Both endpoints are derived from the panel size, so the flight layer and the
 * two layouts it hands off to cannot drift apart when the viewport changes.
 */
export function computeFlight(size: StageSize): FlightGeometry {
  const { panelW, panelH } = size
  const innerW = panelW - COVER_INSET * 2
  const innerH = panelH - COVER_INSET * 2
  return {
    // The folded half is mirrored about x = panelW, but the hero is centred on
    // the cover, so the mirror is a no-op on x and only the inset survives.
    x0: panelW * 0.5,
    y0: COVER_INSET + COVER_ART.cy * innerH,
    w0: COVER_ART.w * innerW,
    x1: (DETAIL_ART.x + DETAIL_ART.w / 2) * panelW,
    y1: (DETAIL_ART.y + DETAIL_ART.w / 2) * panelW,
    w1: DETAIL_ART.w * panelW,
  }
}

export interface FlightFrame {
  /** 0 = parked on the cover, 1 = landed in the detail pane */
  t: number
  /** extra scale from the lift arc — returns to exactly 1 at both ends */
  pop: number
  /** height above the glass, in px */
  z: number
}

/**
 * Flight timing. A plain lerp across the whole sweep loses the effect
 * completely: the hero has to *hold* while the cover rotates out from under it,
 * because that hold is the only thing that reads as "lifted off the outer
 * display". Travel starts once the panel is visibly moving, and settles early
 * enough that the hand-off back into the pane is a non-event.
 */
export function flightAt(p: number): FlightFrame {
  // The window matters more than the easing. Starting the travel at 0.1 (the
  // obvious choice) sends the hero across the fold while the right half is still
  // nearly edge-on, so it appears to fly off the device into empty space.
  // Waiting until the panel is visibly moving keeps the destination on screen
  // for the whole crossing, and lands the hero just as the device flattens.
  const t = smoothstep(0.3, 0.9, p)
  return {
    t,
    pop: 1 + 0.07 * Math.sin(Math.PI * t),
    z: 30 * Math.sin(Math.PI * t),
  }
}

export interface FoldFrame {
  /** raw progress */
  p: number
  /** eased progress */
  pe: number
  /** rotation of the folding half, 180 = shut, 0 = flat */
  fold: number
  /** camera dolly (px, stage space) that keeps the device optically centred */
  camX: number
  /** camera scale */
  camS: number
  /** camera tilt */
  camRx: number
  /** camera yaw — peaks mid-fold so the hinge is never invisible */
  camRy: number
  /** subtle roll that counters the changing projected mass */
  camRz: number
  /** cover → inner hand-off progress (0 = parked on the cover, 1 = landed) */
  flyT: number
}

/**
 * The single source of truth for the whole scene.
 * Physical fold, camera move, hinge, blur and the UI morph all read from here.
 */
export function computeFrame(p: number, size: StageSize): FoldFrame {
  const { panelW, closedScale } = size
  const raw = clamp01(p)
  const pe = easeInOutCubic(raw)

  const fold = 180 * (1 - easeInOutCubic(raw))

  // Dolly out as the surface area doubles, so the growth reads as "more screen"
  // rather than "bigger phone". The shut size is capped by the stage height.
  const camS = lerp(closedScale, 1, pe)

  // Yaw peaks mid-fold: it keeps the fold plane visible instead of edge-on,
  // and settles back to a clean frontal read for the UI at both ends.
  const camRy = 26 * Math.sin(Math.PI * Math.pow(pe, 0.88))
  const camRx = lerp(9, 0, smoothstep(0, 0.8, pe))
  // A restrained roll gives the hinge a more physical, camera-mounted feel.
  // It peaks before the panel reaches edge-on, then settles cleanly.
  const camRz = 2.8 * Math.sin(Math.PI * Math.pow(pe, 0.92)) * (1 - 0.35 * pe)

  // Optical centring. The shut device only occupies the left half, and while it
  // swings open the projected span becomes [-panelW, panelW·cos(fold - yaw)].
  // Recentring on that span keeps the device optically still through the whole
  // sweep instead of sliding sideways at the end.
  const span = Math.max(0, Math.cos(((fold - camRy) * Math.PI) / 180))
  const camX = 0.5 * panelW * camS * (1 - span)

  return { p: raw, pe, fold, camX, camS, camRx, camRy, camRz, flyT: flightAt(raw).t }
}

/** The film opens its left leaf over the right leaf; its camera stays restrained. */
export function computeReferenceFrame(p: number, size: StageSize): FoldFrame {
  const f = computeFrame(p, size)
  const turn = Math.sin(Math.PI * f.pe)
  const camS = lerp(1.12, 1, f.pe)
  const camRy = -7 * turn
  const span = Math.max(0, Math.cos((f.fold + camRy) * Math.PI / 180))
  return { ...f, camS, camX: -0.5 * size.panelW * camS * (1 - span),
    camRx: 0, camRy, camRz: 0 }
}

/** Device sizing: the open device may never overflow the stage. */
export const PANEL_MAX_W = 372

export interface StageSize {
  panelW: number
  panelH: number
  /** How much the camera dollies in while the device is shut. */
  closedScale: number
}

export function computePanelSize(
  stageW: number,
  stageH: number,
  density = 0.78,
  fill = 0.42,
  ratio = PANEL_RATIO,
): StageSize {
  // Never let the *open* device (2 panels wide) overflow the stage.
  const panelW = clamp(Math.min((stageH * density) / ratio, stageW * fill), 104, PANEL_MAX_W)
  const panelH = panelW * ratio
  const closedScale = clamp((stageH * 0.88) / panelH, 1, 1.34)
  return { panelW, panelH, closedScale }
}

/** Write one frame of the scene onto an element as custom properties. */
export function writeFoldVars(el: HTMLElement, p: number, size: StageSize, blur = 0, reference = false) {
  const f = reference ? computeReferenceFrame(p, size) : computeFrame(p, size)
  const g = computeFlight(size)
  const fl = flightAt(f.p)
  const s = el.style
  s.setProperty('--p', f.p.toFixed(4))
  s.setProperty('--pe', f.pe.toFixed(4))
  s.setProperty('--fold', f.fold.toFixed(3))
  s.setProperty('--cam-x', `${f.camX.toFixed(2)}px`)
  s.setProperty('--cam-s', f.camS.toFixed(4))
  s.setProperty('--cam-rx', `${f.camRx.toFixed(3)}deg`)
  s.setProperty('--cam-ry', `${f.camRy.toFixed(3)}deg`)
  s.setProperty('--cam-rz', `${f.camRz.toFixed(3)}deg`)
  s.setProperty('--blur', `${blur.toFixed(2)}px`)
  s.setProperty('--t-crease', creaseAt(f.p).toFixed(4))
  const fo = focusAt(f.p)
  const maxDefocus = size.panelW * DEFOCUS
  s.setProperty('--t-focus-out', fo.out.toFixed(4))
  s.setProperty('--t-focus-a', fo.a.toFixed(4))
  s.setProperty('--t-focus-b', fo.b.toFixed(4))
  s.setProperty('--blur-cover', fo.out === 0 ? '0px' : `${(maxDefocus * fo.out * 0.45).toFixed(2)}px`)
  s.setProperty('--cover-filter', fo.out === 0 ? 'none' : `blur(${(maxDefocus * fo.out * 0.45).toFixed(2)}px)`)
  s.setProperty('--soft-edge', `${((1 - fo.a) * 50).toFixed(3)}%`)
  s.setProperty('--moving-filter', fo.a === 1 ? 'none' : `blur(${(maxDefocus * (1 - fo.a)).toFixed(2)}px)`)
  s.setProperty('--fly-x0', `${g.x0.toFixed(2)}px`)
  s.setProperty('--fly-y0', `${g.y0.toFixed(2)}px`)
  s.setProperty('--fly-w0', `${g.w0.toFixed(2)}px`)
  s.setProperty('--fly-x1', `${g.x1.toFixed(2)}px`)
  s.setProperty('--fly-y1', `${g.y1.toFixed(2)}px`)
  s.setProperty('--fly-w1', `${g.w1.toFixed(2)}px`)
  s.setProperty('--t-fly', fl.t.toFixed(4))
  s.setProperty('--fly-pop', fl.pop.toFixed(4))
  s.setProperty('--fly-z', `${fl.z.toFixed(2)}px`)
  // The contact shadow is only there while the hero is actually airborne.
  s.setProperty('--fly-floor-op', (Math.sin(Math.PI * fl.t) * 0.55).toFixed(4))
  // Billboard strength. Zero at both ends, so the hero is exactly coplanar with
  // the glass while it is parked on the cover and again once it has landed —
  // only the airborne middle is kept facing the viewer.
  s.setProperty('--fly-bill', Math.sin(Math.PI * fl.t).toFixed(4))
  return f
}

export interface Chapter {
  id: string
  index: string
  title: string
  body: string
  /** [riseStart, riseEnd, fallStart, fallEnd] in progress space */
  range: [number, number, number, number]
  tag: string
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'closed',
    index: '00',
    title: 'Fold UI',
    body: '一个由单一 progress 变量驱动的折叠界面实验。屏幕空间、内容布局、铰链、景深与光影，全部是它的函数。滚动，让它展开。',
    range: [0, 0, 0.05, 0.11],
    tag: 'cover display · 180°',
  },
  {
    id: 'unfolding',
    index: '01',
    title: '展开',
    body: '机身不动，右半绕铰链转 180°。相机同时后拉并轻微偏航——这样在折面垂直于视线的那一刻，你仍然看得见它。',
    range: [0.12, 0.2, 0.32, 0.4],
    tag: 'hinge sweep · 180° → 60°',
  },
  {
    id: 'reacting',
    index: '02',
    title: '内容重排',
    body: '内容不是被放大，而是重新布局。同一张封面从左半横跨折痕飞向右侧详情面板，列表在它腾出来的位置上长出来。',
    range: [0.42, 0.5, 0.64, 0.71],
    tag: 'layout morph · 60° → 12°',
  },
  {
    id: 'open',
    index: '03',
    title: '展开完成',
    body: '两块屏幕、同一块画布。铰链退成一道几乎看不见的折痕，界面从单栏长成双栏——而用户的视线不需要重新定位。',
    range: [0.76, 0.84, 1.4, 1.5],
    tag: 'dual pane · 0°',
  },
]
