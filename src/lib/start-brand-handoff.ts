/**
 * Runs `update` (the splash → app swap) inside a shared-element view
 * transition when the browser supports it. Without support — or under
 * prefers-reduced-motion — the update runs bare and the splash's own exit
 * fade is the whole transition. Resolves once the swap has settled.
 *
 * Wrap React state changes in `flushSync` inside `update` so the DOM is
 * mutated within the transition callback.
 */
export async function startBrandHandoff(update: () => void): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // lib.dom types the method unconditionally; happy-dom and Firefox lack it
  if (document.startViewTransition === undefined || reduce) {
    update()
    return
  }
  const transition = document.startViewTransition(update)
  try {
    await transition.finished
  } catch {
    // a skipped or interrupted transition has still applied the DOM update
  }
}
