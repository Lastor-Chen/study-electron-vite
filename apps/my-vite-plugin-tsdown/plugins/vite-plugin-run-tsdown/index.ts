import { tsBuild } from './compiler'
import { cyan, green } from './simpleColor'
import tsdownPkg from 'tsdown/package.json' with { type: 'json' }

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

        if (options.shared?.env) {
          options.shared.env = {
            ...importMetaEnv,
            ...options.shared.env,
          }
        }

        options.builds.forEach((build) => {
          if (build.env) {
            build.env = {
              ...importMetaEnv,
              ...build.env,
            }
          }
        })
      },
      configureServer() {
        if (!isServe) return

        console.log(
          cyan(`\ntsdown v${tsdownPkg.version}`),
          green('building for development...'),
        )

        // 不 await 避免阻塞 vite
        void tsBuild({
          builds: options.builds,
          shared: options.shared,
        })
      },
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        if (!isBuild) return

        console.log(
          cyan(`\ntsdown v${tsdownPkg.version}`),
          green('building for production...'),
        )

        void tsBuild({
          builds: options.builds,
          shared: options.shared,
        })
      },
    },
  ]
}
