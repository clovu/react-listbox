import { join } from 'node:path'
import { defineConfig } from 'bumpp'

export default defineConfig({
  cwd: join(__dirname, 'packages/listbox'),
})
