'use client'

/* SplitText — staggered char-reveal display type (docs/brand/motion.md arrival).
   Ported from Crawford-Young.github.io/src/components/effects/split-text.tsx.
   Characters rise from y:110% + fade in, sequenced left-to-right, grouped in
   overflow-hidden per-word spans so each glyph is masked until it settles.

   Token map from the portfolio original:
     duration 0.55s → MOTION.hero (600ms)
     ease [0.22,1,0.36,1] → EASE.out
     char delay 0.028s → STAGGER.charMs (28ms)

   Deliberate deviations from the portfolio source:
     1. True sequential char index ACROSS words. The portfolio used
        `wi * word.length + ci`, which mis-staggers unequal-length words
        (a long word inflates every later word's start). We track a running
        char offset so the cadence is uniform end-to-end.
     2. Word gaps are STATIC `&nbsp;` spans. The portfolio animated whitespace
        opacity — an invisible no-op — so we drop the motion on the gap.
     3. A11y: a visually-hidden `sr-only` text sibling + aria-hidden on the
        word spans. The portfolio left the split glyphs exposed, so assistive
        tech announced the text twice. `aria-label` on the wrapper was
        rejected — it is prohibited on a role-less generic span (axe/Lighthouse
        rule `aria-prohibited-attr`). Instead an `sr-only` span carries the
        real contiguous text (announced once) while the decorative per-char
        structure stays hidden from the accessibility tree.
     4. `delayMs` prop is in milliseconds (library convention) and converted to
        seconds only at the framer boundary. */

import * as React from 'react'
import { motion } from 'framer-motion'
import { EASE, MOTION, STAGGER } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

const MS_PER_SECOND = 1000
const CHAR_RISE = '110%'

export interface SplitTextProps {
  /** The text to reveal, split into per-character animated glyphs. */
  readonly text: string
  /** Applied to the wrapper span (sizing, weight, color). */
  readonly className?: string
  /** Delay before the first character rises, in milliseconds. */
  readonly delayMs?: number
}

export function SplitText({ text, className, delayMs = 0 }: SplitTextProps): React.JSX.Element {
  const reduced = usePrefersReducedMotion()

  if (reduced) return <span className={className}>{text}</span>

  const words = text.split(' ')
  const durationSec = MOTION.hero / MS_PER_SECOND
  const charStepSec = STAGGER.charMs / MS_PER_SECOND
  const baseDelaySec = delayMs / MS_PER_SECOND

  // Running index of the current glyph across every word — deviation (1).
  let charIndex = 0

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true" className="inline-block overflow-hidden">
          {word.split('').map((char, ci) => {
            const delaySec = baseDelaySec + charIndex * charStepSec
            charIndex += 1
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ y: CHAR_RISE, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: durationSec, delay: delaySec, ease: [...EASE.out] }}
              >
                {char}
              </motion.span>
            )
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}
