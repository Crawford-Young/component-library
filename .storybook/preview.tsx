import type { Preview } from '@storybook/react'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import '../src/styles/index.css'
import './tailwind.css'

injectAnalytics()
injectSpeedInsights()

const preview: Preview = {
  parameters: {
    // Storybook 9+ looks `globals.backgrounds.value` up as a KEY of `options`. The keys are the
    // hex values themselves so the global still carries the colour: the decorator below and the
    // `&globals=backgrounds.value:!hex(ffffff)` light-mode URLs (e2e, cl-gates) keep working.
    backgrounds: {
      options: {
        '#09090b': { name: 'dark', value: '#09090b' },
        '#ffffff': { name: 'light', value: '#ffffff' },
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: '#09090b' },
  },
  decorators: [
    (Story, context) => {
      const isDark = (context.globals['backgrounds']?.value ?? '#09090b') === '#09090b'
      document.documentElement.classList.toggle('dark', isDark)
      return Story()
    },
  ],
}

export default preview
