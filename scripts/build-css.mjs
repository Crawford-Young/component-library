import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist/themes', { recursive: true })

const tokens = readFileSync('src/styles/tokens.css', 'utf8')
const base = readFileSync('src/styles/base.css', 'utf8')

writeFileSync('dist/styles.css', `${tokens}\n\n${base}\n`)

const carsickyak = readFileSync('src/styles/themes/carsickyak.css', 'utf8')
writeFileSync('dist/themes/carsickyak.css', carsickyak)

console.log('✓ dist/styles.css + dist/themes/carsickyak.css written')
