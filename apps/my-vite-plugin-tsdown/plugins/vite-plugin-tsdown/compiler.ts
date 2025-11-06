import { build as tsBuild } from 'tsdown'
import type { Options } from 'tsdown'

export type TsCompileOptions = {
  main: string | string[]
  preload: string
  outDir: string
  watch?: string | string[]
  logInfo?: boolean
  buildEnd?: () => void
}

export async function tsCompile(options: TsCompileOptions) {
  const {
    main,
    preload,
    outDir,
    watch,
    logInfo,
    buildEnd,
  } = options

  let threadCount = 0

  const commonConfig = {
    target: ['node22'],
    external: 'electron',
    tsconfig: 'tsconfig.electron.json',
    config: false,
    watch,
    logLevel: logInfo ? 'info' : 'warn',
    onSuccess() {
      if (threadCount >= 1) {
        threadCount = 0
        buildEnd?.()
      } else {
        threadCount++
      }
    },
  } satisfies Options

  // compile main
  await tsBuild({
    ...commonConfig,
    name: 'Main',
    entry: Array.isArray(main) ? [...main, `!${preload}`] : [main, `!${preload}`],
    outDir,
    format: ['esm'],
    unbundle: true,
  })

  // compile preload
  await tsBuild({
    ...commonConfig,
    name: 'Preload',
    entry: preload,
    outDir: 'dist-electron/electron/preload',
    format: ['cjs'],
  })
}
