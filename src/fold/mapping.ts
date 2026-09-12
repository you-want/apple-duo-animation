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

/* ==========================================================================
   Focus hand-off (study 03)
   --------------------------------------------------------------------------
   The reference video does not cross-fade the two displays. The surface that
   is *moving* goes out of focus, and the surface arriving behind it pulls
   focus as it settles. Because the two halves are at different phases of the
   same rotation, the sharp region sweeps across the display from the hinge
   outward instead of snapping in everywhere at once.

   So there is no opacity ramp here — only three sharpness scalars, read by a
   pair of stacked layers per half (sharp below, defocused above, masked).
   ========================================================================== */

/** Peak defocus, as a fraction of the panel width. */
export const DEFOCUS = 0.085

/** How much of the blurred band is a soft ramp, as a fraction of the half. */
export const FOCUS_FEATHER = 0.14

export interface FocusFrame {
  /** 0 = the cover display is sharp, 1 = it has blurred away entirely */
  out: number
  /** sharpness of the folding half — the one back-to-back with the cover */
  a: number
  /** sharpness of the fixed half, which was underneath it */
  b: number
}

/**
 * Three focus pulls, each with its own window:
 *
 * - `out` runs the whole length of the cover's exit. The cover is still legible
 *   until it goes edge-on at 0.5, so the defocus is spread across that approach
 *   instead of being spent in the first degrees. It is also back-loaded: while
 *   the cover is still the only readable surface on screen, it has to stay
 *   close to sharp, so the ramp does most of its work once the hinge is
 *   actually swinging (see the exponent below). The last of the ramp lands
 *   after the panel has turned away, where it costs nothing because there is no
 *   longer a surface facing the camera.
 * - `b` (the half underneath) is uncovered from the very first degrees, so it
 *   is the one the eye reads as "the picture arriving out of focus".
 * - `a` (the folding half) only turns its face to the viewer past 90° (0.5), so
 *   its pull starts there — and it is the shorter window of the two, because
 *   this half is the one the eye ends up reading: it has to be resolved before
 *   the device flattens, not still arriving as it settles.
 *
 * The three windows say *where* the sharp region is. How deep the defocus on
 * the inner halves is allowed to get is a separate ramp — see `defocusDepth`.
 */
export function focusAt(p: number): FocusFrame {
  return {
    // A plain smoothstep spends too much of its range on the first degrees, so
    // the cover is visibly soft before the inner display has shown anything at
    // all — which reads as "the outer screen smeared for no reason". Raising
    // the window to a power keeps the first third of the sweep nearly sharp and
    // then lets the blur arrive over the part of the fold the viewer can
    // actually see moving.
    out: Math.pow(smoothstep(0.14, 0.56, p), 1.7),
    a: smoothstep(0.5, 0.82, p),
    b: smoothstep(0.1, 0.72, p),
  }
}

/**
 * How deep the defocus on the inner halves is allowed to get, as a fraction of
 * `DEFOCUS`.
 *
 * The blurred copy used to carry the full radius from its first visible frame,
 * so the inner display arrived as a finished smudge: whatever sliver was
 * uncovered was already at peak blur, and the blur therefore *switched on*
 * instead of arriving. Ramping the depth lets the surface come in soft, deepen
 * as more of it is uncovered, and only reach full strength by the time the
 * device is open — so the eye never catches the moment the blur appears.
 */
export function defocusDepth(p: number) {
  return smoothstep(0.06, 0.56, p)
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
): StageSize {
  // Never let the *open* device (2 panels wide) overflow the stage.
  const panelW = clamp(Math.min((stageH * density) / PANEL_RATIO, stageW * fill), 104, PANEL_MAX_W)
  const panelH = panelW * PANEL_RATIO
  const closedScale = clamp((stageH * 0.88) / panelH, 1, 1.34)
  return { panelW, panelH, closedScale }
}

/** Write one frame of the scene onto an element as custom properties. */
export function writeFoldVars(el: HTMLElement, p: number, size: StageSize, blur = 0) {
  const f = computeFrame(p, size)
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
  // Whole-surface blur for the cover display — it is leaving, so a single
  // uniform defocus is enough; only the inner halves get the sweeping band.
  s.setProperty('--blur-cover', `${(maxDefocus * fo.out).toFixed(2)}px`)
  // Both halves share one radius and the *band* shrinks: that is what makes the
  // two halves read as one focus sweep rather than two independent fades. The
  // radius is ramped rather than pinned at the peak, so the blur deepens as the
  // inner display is uncovered instead of being there from its first sliver.
  s.setProperty('--blur-defocus', `${(maxDefocus * defocusDepth(f.p)).toFixed(2)}px`)
  s.setProperty('--focus-band-a', `${((1 - fo.a) * 100).toFixed(3)}%`)
  s.setProperty('--focus-band-b', `${((1 - fo.b) * 100).toFixed(3)}%`)
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
