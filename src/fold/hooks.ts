import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { computePanelSize } from './mapping'
import type { StageSize } from './mapping'

/**
 * Measures the stage and publishes --panel-w / --panel-h / --persp.
 * Perspective is derived from the panel width so the 3D reads identically
 * at every viewport size.
 */
export function useStageSize<T extends HTMLElement>(density = 0.78) {
  const ref = useRef<T | null>(null)
  const size = useRef<StageSize>({ panelW: 300, panelH: 618, closedScale: 1 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      // Layout intent comes from CSS, so a narrow viewport can ask the device to
      // fill more of its width without touching the engine.
      const fill = parseFloat(getComputedStyle(el).getPropertyValue('--fold-fill')) || 0.42
      const next = computePanelSize(rect.width, rect.height, density, fill)
      size.current = next
      el.style.setProperty('--panel-w', `${next.panelW.toFixed(2)}px`)
      el.style.setProperty('--panel-h', `${next.panelH.toFixed(2)}px`)
      el.style.setProperty('--persp', `${(next.panelW * 9).toFixed(1)}px`)
      el.dispatchEvent(new CustomEvent('fold:resize', { detail: next.panelW }))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [density])

  return { ref, size }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Adds `is-in` the first time an element scrolls into view. */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

/** Pointer drag → progress delta. Used by the playground. */
export function useDragProgress(onDelta: (dx: number, dy: number) => void) {
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      onDelta(dx, dy)
    },
    [onDelta],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    const el = e.currentTarget as HTMLElement
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}
