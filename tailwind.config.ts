import type { Config } from 'tailwindcss'
import { cyUIPreset } from './src/tailwind/preset'

const config: Config = {
  presets: [cyUIPreset as Config],
  content: ['./src/**/*.{ts,tsx}', './stories/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
}

export default config
