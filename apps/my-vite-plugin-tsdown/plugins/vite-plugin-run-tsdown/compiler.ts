import { build } from 'tsdown'
import type { InlineConfig } from 'tsdown'

export type TsBuildOptions = {
  builds: InlineConfig[]
  shared?: InlineConfig
  /** 只在 builds 全部成功完成後執行, 這會覆蓋所有的 onSuccess */
  onAllSuccess?: InlineConfig['onSuccess']
}

const defaultConfig: InlineConfig = {
  config: false,
}

export async function tsBuild(options: TsBuildOptions) {
  if (process.isTsdownWatched) return

  const { builds, shared, onAllSuccess } = options

  let buildCount = 0
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

    const isLast = buildCount === builds.length - 1
    if (onAllSuccess) {
      buildOption.onSuccess = isLast ?
        onAllSuccess :
        () => { buildCount++ }
    }

    await build(buildOption)
  }
}
