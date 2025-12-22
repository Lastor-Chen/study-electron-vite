import path from 'node:path'

import { tsBuild } from './compiler'

import type { Plugin } from 'vite'
import type { InlineConfig } from 'tsdown'
import type { TsBuildOptions } from './compiler'

export * from './electronStartup'

interface WithNoViteWatch extends TsBuildOptions {
  viteWatch?: undefined
}

interface WithViteWatch extends TsBuildOptions {
  /** Glob pattern. Cannot be used with tsdown watch at the same time. */
  viteWatch?: string[]
  builds: Omit<InlineConfig, 'watch'>[]
}

export type TsdownPluginOptions = WithViteWatch | WithNoViteWatch

export function tsdownPlugin(options: TsdownPluginOptions): Plugin[] {
  const { viteWatch } = options

  let isServe: boolean = false
  let isBuild: boolean = false

  const cwd = process.cwd()

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
      configureServer(server) {
        if (!isServe) return

        // 不 await 避免阻塞 vite
        void tsBuild(options)

        if (viteWatch) {
          server.watcher.on('change', (file) => {
            const relativePath = path.relative(cwd, file)
            const isMatch = viteWatch.some((pattern) => path.matchesGlob(relativePath, pattern))
            if (!isMatch) return

            void tsBuild(options)
          })
        }
      },
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        if (!isBuild) return

        void tsBuild(options)
      },
    },
  ]
}
