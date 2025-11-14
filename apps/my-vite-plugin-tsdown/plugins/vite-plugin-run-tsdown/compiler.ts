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
  const { builds, shared, onAllSuccess } = options

  let buildCount = 0
  for (const userConfig of builds) {
    const buildOption: InlineConfig = {
      ...defaultConfig,
      ...shared,
      ...userConfig,
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
