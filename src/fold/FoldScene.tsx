import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { useStageSize } from './hooks'
import { writeFoldVars } from './mapping'

/**
 * Static fold scene: a scope element that measures itself and paints a fixed
 * progress onto the same channel system the animated scenes use.
 */
export function FoldScene({
  progress,
  className,
  density,
  children,
}: {
  progress: number
  className?: string
  density?: number
  children: ReactNode
}) {
  const { ref, size } = useStageSize<HTMLDivElement>(density)

  useLayoutEffect(() => {
    if (ref.current) writeFoldVars(ref.current, progress, size.current, 0)
  }, [progress, size, ref])

  return (
    <div ref={ref} className={className ? `fold-scope ${className}` : 'fold-scope'}>
      {children}
    </div>
  )
}
