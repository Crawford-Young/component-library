import * as React from 'react'
import { cn } from '@/lib/utils'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export interface CountUpProps {
  to: number
  suffix?: string
  duration?: number
  className?: string
}

export function CountUp({ to, suffix = '', duration = 1400, className }: CountUpProps) {
  const [value, setValue] = React.useState(to)
  const reduced = usePrefersReducedMotion()
  const started = React.useRef(false)
  const elRef = React.useRef<HTMLSpanElement>(null)

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
    observer.observe(elRef.current!)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [to, duration, reduced])

  return (
    <span ref={elRef} className={cn(className)}>
      {value}
      {suffix}
    </span>
  )
}
