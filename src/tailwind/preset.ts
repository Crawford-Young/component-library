// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindAnimate = require('tailwindcss-animate') as typeof import('tailwindcss-animate')
import type { Config } from 'tailwindcss'

export const cyUIPreset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          foreground: 'rgb(var(--warning-foreground) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          foreground: 'rgb(var(--info-foreground) / <alpha-value>)',
        },
        // Semantic aliases used by component CVA variants
        primary: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--surface-raised) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'draw-check': {
          to: { strokeDashoffset: '0' },
        },
        'radio-dot': {
          from: { transform: 'scale(0)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'switch-thumb': {
          '50%': { scale: '1.1' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)', opacity: '1' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateX(100%)', opacity: '1' },
        },
      },
      animation: {
        'draw-check': 'draw-check 150ms ease-out forwards',
        'radio-dot': 'radio-dot 120ms ease-out',
        'switch-thumb': 'switch-thumb 200ms ease-in-out',
        'progress-indeterminate': 'progress-indeterminate 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindAnimate],
}
