import { build as tsBuild } from 'tsdown'
import type { Options as TsdownOptions } from 'tsdown'

export type BaseOptions = {
  main: TsdownOptions
  preload: TsdownOptions
  tsconfig?: TsdownOptions['tsconfig']
  watch?: string | string[]
}

export interface TsCompileOptions extends BaseOptions {
  onSuccess?: TsdownOptions['onSuccess']
  logInfo?: boolean
}

export async function tsCompile(options: TsCompileOptions) {
  const {
    main,
    preload,
    tsconfig,
    watch,
    logInfo,
    onSuccess,
  } = options

  const commonConfig: TsdownOptions = {
    config: false,
    external: 'electron',
    tsconfig,
    watch,
    logLevel: logInfo ? 'info' : 'warn',
  }

  // compile main
  await tsBuild({
    ...commonConfig,
    name: 'Main',
    format: ['esm'],
    unbundle: true,
    ...main,
  })

  // compile preload
  await tsBuild({
    ...commonConfig,
    name: 'Preload',
    format: ['cjs'],
    onSuccess,
    ...preload,
  })
}
