import type { Preview } from '@storybook/react'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import '../src/styles/index.css'
import './tailwind.css'

injectAnalytics()
injectSpeedInsights()

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#09090b' },
        { name: 'light', value: '#ffffff' },
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
      const isDark = (context.globals['backgrounds']?.value ?? '#09090b') === '#09090b'
      document.documentElement.classList.toggle('dark', isDark)
      return Story()
    },
  ],
}

export default preview
