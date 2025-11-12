import { build as tsBuild } from 'tsdown'
import type { InlineConfig } from 'tsdown'

interface TsdownOptions extends Omit<InlineConfig, 'config'> {
  /** @default main: "Main", preload: "Preload" */
  name?: InlineConfig['name']
  /** Default to main: `"./electron/index.ts"`, preload: `"./electron/preload.cts"` */
  entry?: InlineConfig['entry']
  /** @default "./dist-electron" */
  outDir?: InlineConfig['outDir']
  /** @default main: "esm", preload: "cjs" */
  format?: InlineConfig['format']
  /** @default main: true, preload: false */
  clean?: InlineConfig['clean']
  /** @default "electron" */
  external?: InlineConfig['external']
  /** @default serve: "warn", build: "info" */
  logLevel?: InlineConfig['logLevel']
}

export type BaseOptions = {
  main?: TsdownOptions
  preload?: TsdownOptions
  tsconfig?: TsdownOptions['tsconfig']
  env?: TsdownOptions['env']
}

export interface TsCompileOptions extends BaseOptions {
  watch?: string | string[]
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
    env,
  } = options

  const commonConfig: InlineConfig = {
    config: false,
    external: 'electron',
    tsconfig,
    watch,
    logLevel: logInfo ? 'info' : 'warn',
    env,
  }

  // compile main
  await tsBuild({
    ...commonConfig,
    name: 'Main',
    entry: './electron/index.ts',
    format: 'esm',
    outDir: './dist-electron',
    unbundle: true,
    ...main,
  })

  // compile preload
  await tsBuild({
    ...commonConfig,
    name: 'Preload',
    entry: './electron/preload.cts',
    format: 'cjs',
    outDir: './dist-electron',
    clean: false,
    onSuccess,
    ...preload,
  })
}
