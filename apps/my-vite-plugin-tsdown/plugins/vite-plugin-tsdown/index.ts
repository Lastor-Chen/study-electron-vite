import { tsCompile } from './compiler'
import { spawnElectron } from './electronStartup'

import type { Plugin } from 'vite'

export type Options = {
  input: string | string[]
  preload: string
  outDir: string
  watch?: string | string[]
}

const pluginName = 'vite-plugin-electron-tsdown'

export default function tsdownPlugin(options: Options): Plugin[] {
  const {
    input,
    preload,
    outDir,
    watch = '',
  } = options

  return [
    {
      name: pluginName,
      apply: 'serve',
      configureServer() {
        console.log('serve')
        // 不 await 避免阻塞 vite
        void tsCompile({
          main: input,
          preload: preload,
          outDir: outDir,
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
          main: input,
          preload,
          outDir,
          logInfo: true,
        })
      },
    },
  ]
}
