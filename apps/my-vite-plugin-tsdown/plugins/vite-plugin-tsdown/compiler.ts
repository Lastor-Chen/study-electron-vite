import { build as tsBuild } from 'tsdown'
import type { Options } from 'tsdown'

export async function tsCompile(
  main: string | string[],
  preload: string,
  outDir: string,
  onSuccess?: () => void
) {
  let threadCount = 0

  const commonConfig = {
    target: ['node22'],
    external: 'electron',
    tsconfig: 'tsconfig.electron.json',
    config: false,
    watch: ['electron', 'shared'],
    logLevel: 'warn',
    onSuccess() {
      if (threadCount >= 1) {
        threadCount = 0
        onSuccess?.()
      } else {
        threadCount++
      }
    },
  } satisfies Options

  // compile main
  await tsBuild({
    ...commonConfig,
    entry: Array.isArray(main) ? [...main, `!${preload}`] : [main, `!${preload}`],
    outDir,
    format: ['esm'],
    unbundle: true,
  })

  // compile preload
  await tsBuild({
    ...commonConfig,
    entry: preload,
    outDir: 'dist-electron/electron/preload',
    format: ['cjs'],
  })
}
