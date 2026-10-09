import { defineConfig } from 'tsup'

// One config, two entries: with a config array, the first config's `clean: true`
// wipes dist/ while the second config's dts build is still writing, which dropped
// dist/tailwind/index.d.ts from the published package.
export default defineConfig({
  entry: { index: 'src/index.ts', 'tailwind/index': 'src/tailwind/index.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'tailwindcss',
    'tailwindcss-animate',
    'lucide-react',
    'framer-motion',
  ],
  outDir: 'dist',
})
