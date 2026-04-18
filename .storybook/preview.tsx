import type { Preview } from '@storybook/react'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import '../src/styles/index.css'
import './tailwind.css'

injectAnalytics()
injectSpeedInsights()

const DARK_BG = '#111009'
const LIGHT_BG = '#f5f3ea'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: DARK_BG },
        { name: 'light', value: LIGHT_BG },
      ],
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = (context.globals['backgrounds']?.value ?? DARK_BG) === DARK_BG
      document.documentElement.classList.toggle('dark', isDark)
      return Story()
    },
  ],
}

export default preview
