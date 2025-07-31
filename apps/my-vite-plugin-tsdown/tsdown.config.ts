import childProc from 'node:child_process'
import path from 'node:path'

import { defineConfig } from 'tsdown'
import electronPath from 'electron'

import type { ChildProcess } from 'node:child_process'
import type { UserConfig } from 'tsdown'

//#region watch-dev
let child: ChildProcess | null = null

function startElectron(entryFile: string) {
  if (process.env.NODE_ENV !== 'development') return

  if (child && !child.killed) {
    child.removeAllListeners() // 避免 restart 觸發 onClose
    child.kill()
  }

  child = childProc.spawn(
    electronPath as unknown as string,
    [entryFile],
    { stdio: 'inherit' },
  )

  child.on('close', (code) => process.exit(code))
}
//#endregion watch-dev

const commonConfig = {
  target: ['node22'],
  outDir: 'dist-electron',
  external: 'electron',
  tsconfig: 'tsconfig.electron.json',
} satisfies UserConfig

export default defineConfig([
  // 單獨處理 electron preload
  {
    ...commonConfig,
    entry: ['./electron/preload.cts'],
    format: ['cjs'],
  },
  {
    ...commonConfig,
    entry: ['./electron', '!electron/preload.cts'],
    format: ['esm'],
    hooks: {
      'build:done': (ctx) => {
        const entryFile = path.join(ctx.options.outDir, './index.js')
        startElectron(entryFile)
      },
    }
  },
])
