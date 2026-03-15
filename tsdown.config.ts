import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: 'packages/*',
  entry: [
    'src/index.ts',
  ],
  dts: true,
  exports: true,
  publint: true,
  deps: {
    skipNodeModulesBundle: true,
  },
})
