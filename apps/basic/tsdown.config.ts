import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

const common: UserConfig = {
  target: ['node22'],
  outDir: 'dist-electron',
  external: 'electron',
  tsconfig: 'tsconfig.electron.json',
}

export default defineConfig([
  {
    ...common,
    entry: ['./electron', '!electron/preload.cts'],
    format: ['esm'],
  },
  // 單獨處理 electron preload
  {
    ...common,
    entry: ['./electron/preload.cts'],
    format: ['cjs'],
  },
])
