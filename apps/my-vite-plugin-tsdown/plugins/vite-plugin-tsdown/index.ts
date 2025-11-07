import { tsCompile } from './compiler'
import { spawnElectron } from './electronStartup'

import type { Plugin } from 'vite'

export type Options = {
  main: {
    entry: string | string[]
    outDir: string
  },
  preload: {
    entry: string | string[]
    outDir: string
  },
  watch?: string | string[]
}

const pluginName = 'vite-plugin-electron-tsdown'

export default function tsdownPlugin(options: Options): Plugin[] {
  const {
    main,
    preload,
    watch,
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
          watch,
          buildEnd() {
            void spawnElectron()
          },
        })
      },
    },
    {
      name: pluginName,
      apply: 'build',
      // 只會在 vite 成功完成所有的 build 任務後觸發
      closeBundle() {
        console.log('\ntsdown building...')
        void tsCompile({
          main,
          preload,
          logInfo: true,
        })
      },
    },
  ]
}
