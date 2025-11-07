import { build as tsBuild } from 'tsdown'
import type { Options } from 'tsdown'

export type TsCompileOptions = {
  main: {
    entry: string | string[]
    outDir: string
  }
  preload: {
    entry: string | string[]
    outDir: string
  }
  watch?: string | string[]
  logInfo?: boolean
  buildEnd?: () => void
}

export async function tsCompile(options: TsCompileOptions) {
  const {
    main,
    preload,
    watch,
    logInfo,
    buildEnd,
  } = options

  const commonConfig = {
    target: ['node22'],
    external: 'electron',
    tsconfig: 'tsconfig.electron.json',
    config: false,
    watch,
    logLevel: logInfo ? 'info' : 'warn',
  } satisfies Options

  // compile main
  await tsBuild({
    ...commonConfig,
    name: 'Main',
    entry: main.entry,
    outDir: main.outDir,
    format: ['esm'],
    unbundle: true,
  })

  // compile preload
  await tsBuild({
    ...commonConfig,
    name: 'Preload',
    entry: preload.entry,
    outDir: preload.outDir,
    format: ['cjs'],
    onSuccess() {
      buildEnd?.()
    }
  })
}
