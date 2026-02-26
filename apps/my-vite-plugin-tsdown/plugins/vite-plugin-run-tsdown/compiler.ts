import { build } from 'tsdown'
import tsdownPkg from 'tsdown/package.json' with { type: 'json' }

import { cyan, green } from './simpleColor'

import type { InlineConfig } from 'tsdown'

export type TsBuildOptions = {
  builds: InlineConfig[]
  onAllSuccess?: (signal: AbortSignal) => void
}

const nodeEnv = process.env.NODE_ENV

const defaultConfig: InlineConfig = {
  config: false,
}

export async function tsBuild(options: TsBuildOptions) {
  if (process._vpt.isTsdownWatched) return

  console.log(
    cyan(`\ntsdown v${tsdownPkg.version}`),
    green(`building for ${nodeEnv}...`),
  )

  for (const userConfig of options.builds) {
    const buildOption: InlineConfig = {
      ...defaultConfig,
      ...userConfig,
    }

    // 記住有無 watch, 確保只會執行一次
    // 避免 vite restart 時, tsdown 重複掛載 listener
    if (buildOption.watch && !process._vpt.isTsdownWatched) {
      process._vpt.isTsdownWatched = true
    }

    await build(buildOption)
  }

  process._vpt.ab?.abort()
  afterBuild(options)
}

function afterBuild(opts: TsBuildOptions) {
  if (!opts.onAllSuccess) return

  process._vpt.ab = new AbortController()
  opts.onAllSuccess(process._vpt.ab.signal)
}
