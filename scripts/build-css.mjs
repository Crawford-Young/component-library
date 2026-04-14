import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })

const tokens = readFileSync('src/styles/tokens.css', 'utf8')
const base = readFileSync('src/styles/base.css', 'utf8')

writeFileSync('dist/styles.css', `${tokens}\n\n${base}\n`)

console.log('✓ dist/styles.css written')
