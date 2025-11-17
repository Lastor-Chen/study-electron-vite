import { build } from 'tsdown'
import type { InlineConfig } from 'tsdown'

export type TsBuildOptions = {
  builds: InlineConfig[]
  shared?: InlineConfig
}

const defaultConfig: InlineConfig = {
  config: false,
}

export async function tsBuild(options: TsBuildOptions) {
  if (process.isTsdownWatched) return

  const { builds, shared } = options

  for (const userConfig of builds) {
    const buildOption: InlineConfig = {
      ...defaultConfig,
      ...shared,
      ...userConfig,
    }

    // 記住有無 watch, 確保只會執行一次
    // 避免 vite restart 時, tsdown 重複掛載 listener
    if (buildOption.watch && !process.isTsdownWatched) {
      process.isTsdownWatched = true
    }

    await build(buildOption)
  }
}
