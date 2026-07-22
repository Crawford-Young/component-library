import * as React from 'react'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

export interface CountUpProps {
  /** Target number to count up to. Animation plays once on first viewport entry; subsequent changes update the displayed value without re-animating. */
  to: number
  suffix?: string
  duration?: number
  className?: string
  /** Optional function to format the displayed value. Runs on every animation frame. */
  readonly format?: (value: number) => string
}

export const CountUp = React.forwardRef<HTMLSpanElement, CountUpProps>(
  ({ to, suffix = '', duration = 1400, className, format }, forwardedRef) => {
    const [value, setValue] = React.useState(to)
    const reduced = usePrefersReducedMotion()
    const started = React.useRef(false)
    const internalRef = React.useRef<HTMLSpanElement | null>(null)

    // Merge forwarded ref with internal ref
    const setRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        internalRef.current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef],
    )

    React.useEffect(() => {
      if (reduced) {
        setValue(to)
        return
      }
      if (started.current) return
      let rafId = 0
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || started.current) return
          started.current = true
          observer.disconnect()
          setValue(0)
          const t0 = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(Math.round(eased * to))
            if (p < 1) rafId = requestAnimationFrame(tick)
          }
          rafId = requestAnimationFrame(tick)
        },
        { threshold: 0.5 },
      )
      observer.observe(internalRef.current!)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(rafId)
      }
    }, [to, duration, reduced])

    return (
      <span ref={setRef} className={className}>
        {format !== undefined ? format(value) : value}
        {suffix}
      </span>
    )
  },
)
CountUp.displayName = 'CountUp'
