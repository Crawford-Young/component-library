import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    treeshake: true,
    external: ['react', 'react-dom', 'tailwindcss'],
    outDir: 'dist',
  },
  {
    entry: { 'tailwind/index': 'src/tailwind/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['tailwindcss'],
    outDir: 'dist',
  },
])
