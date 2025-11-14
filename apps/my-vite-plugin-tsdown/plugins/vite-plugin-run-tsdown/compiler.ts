import { build } from 'tsdown'
import type { InlineConfig } from 'tsdown'

export type TsBuildOptions = {
  builds: InlineConfig[]
  shared?: InlineConfig
  onAllSuccess?: Exclude<InlineConfig['onSuccess'], string>
}

const defaultConfig: InlineConfig = {
  config: false,
}

export async function tsBuild(options: TsBuildOptions) {
  const { builds, shared, onAllSuccess } = options

  let buildCount = 0
  for (const userConfig of builds) {
    await build({
      ...defaultConfig,
      ...shared,
      ...userConfig,
      ...(onAllSuccess ? {
        onSuccess(...args) {
          if (buildCount++ === (builds.length - 1)) {
            buildCount = 0
            onAllSuccess(...args)
          }
        },
      } : undefined),
    })
  }
}
