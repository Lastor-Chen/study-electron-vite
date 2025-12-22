import { tsBuild } from './compiler'

import type { Plugin } from 'vite'
import type { TsBuildOptions } from './compiler'

export * from './electronStartup'

export type TsdownPluginOptions = TsBuildOptions

export function tsdownPlugin(options: TsBuildOptions): Plugin[] {
  let isServe: boolean = false
  let isBuild: boolean = false

  return [
    {
      name: 'vite-plugin-run-tsdown',
      config(config, { command }) {
        // save vite command
        isServe = command === 'serve'
        isBuild = command === 'build'

        if (isBuild) return {
          // electron 是走 file:// 協定, 要給相對路徑
          base: config.base || './',
        }
      },
      configResolved(config) {
        // merge vite env
        const importMetaEnv = config.env
        options.builds.forEach((build) => {
          build.env = {
            ...importMetaEnv,
            ...build.env,
          }
        })
      },
      configureServer() {
        if (!isServe) return

        // 不 await 避免阻塞 vite
        void tsBuild(options)
      },
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        if (!isBuild) return

        void tsBuild(options)
      },
    },
  ]
}
