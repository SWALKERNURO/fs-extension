import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
// Export only already-public source files, never environment files or dependencies.
const walk = dir => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (/\.(js|jsx|css)$/.test(path)) console.log('FORMATTED_FILE ' + JSON.stringify({ path: 'bloglist/' + path.replaceAll('\\', '/'), content: readFileSync(path, 'utf8') }))
  }
}
walk('client/src')
walk('server')
