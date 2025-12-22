import { build } from 'tsdown'
import tsdownPkg from 'tsdown/package.json' with { type: 'json' }

import { cyan, green } from './simpleColor'

import type { InlineConfig } from 'tsdown'

export type TsBuildOptions = {
  builds: InlineConfig[]
  onAllSuccess?: () => void
}

const nodeEnv = process.env.NODE_ENV

const defaultConfig: InlineConfig = {
  config: false,
}

export async function tsBuild(options: TsBuildOptions) {
  if (process.isTsdownWatched) return

  console.log(
    cyan(`\ntsdown v${tsdownPkg.version}`),
    green(`building for ${nodeEnv}...`),
  )

  const { builds, onAllSuccess } = options
  for (const userConfig of builds) {
    const buildOption: InlineConfig = {
      ...defaultConfig,
      ...userConfig,
    }

    // 記住有無 watch, 確保只會執行一次
    // 避免 vite restart 時, tsdown 重複掛載 listener
    if (buildOption.watch && !process.isTsdownWatched) {
      process.isTsdownWatched = true
    }

    await build(buildOption)
  }

  onAllSuccess?.()
}
