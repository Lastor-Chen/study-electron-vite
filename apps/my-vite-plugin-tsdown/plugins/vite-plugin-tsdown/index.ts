import { tsCompile } from './compiler'

import type { Plugin } from 'vite'
import type { Options as TsdownOptions } from 'tsdown'
import type { BaseOptions } from './compiler'
import { spawnElectron } from './electronStartup'

export { spawnElectron } from './electronStartup'

export interface TsdownPluginOptions extends BaseOptions {
  /** @default "./electron" */
  watch?: string | string[]
  onDevSuccess?: TsdownOptions['onSuccess']
}

const pluginName = 'vite-plugin-electron-tsdown'

export function tsdownPlugin(options: TsdownPluginOptions = {}): Plugin[] {
  const {
    main,
    preload,
    watch = './electron',
    tsconfig,
    onDevSuccess,
  } = options

  return [
    {
      name: pluginName,
      apply: 'serve',
      configureServer() {
        // 不 await 避免阻塞 vite
        void tsCompile({
          main,
          preload,
          tsconfig,
          watch,
          onSuccess: onDevSuccess ?? (() => {
            void spawnElectron()
          }),
        })
      },
    },
    {
      name: pluginName,
      apply: 'build',
      config(config) {
        if (config.base) return

        // electron 是走 file:// 協定, 要給相對路徑
        return {
          base: './',
        }
      },
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        console.log('\ntsdown building...')
        void tsCompile({
          main,
          preload,
          tsconfig,
          logInfo: true,
        })
      },
    },
  ]
}
