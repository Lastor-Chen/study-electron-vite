import { tsCompile } from './compiler'
import { spawnElectron } from './electronStartup'

import type { Plugin } from 'vite'
import type { Options as TsdownOptions } from 'tsdown'
import type { BaseOptions } from './compiler'

export { spawnElectron } from './electronStartup'

export interface TsdownPluginOptions extends BaseOptions {
  /** @default "./electron" */
  watch?: string | string[]
  onDevSuccess?: TsdownOptions['onSuccess']
}

export function tsdownPlugin(options: TsdownPluginOptions = {}): Plugin[] {
  const {
    main,
    preload,
    watch = './electron',
    tsconfig,
    onDevSuccess,
    env,
  } = options

  let isServe: boolean = false
  let isBuild: boolean = false
  let mergedEnv: Record<string, any> = {}

  return [
    {
      name: 'vite-plugin-electron-tsdown',
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
        mergedEnv = {
          ...config.env,
          ...env,
        }
      },
      configureServer() {
        if (!isServe) return

        // 不 await 避免阻塞 vite
        void tsCompile({
          main,
          preload,
          tsconfig,
          watch,
          env: mergedEnv,
          onSuccess: onDevSuccess ?? (() => {
            void spawnElectron()
          }),
        })
      },
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        if (!isBuild) return

        console.log('\ntsdown building...')
        void tsCompile({
          main,
          preload,
          tsconfig,
          logInfo: true,
          env: mergedEnv,
        })
      },
    },
  ]
}
