import { tsCompile } from './compiler'
import { spawnElectron } from './electronStartup'

import type { Plugin } from 'vite'

export type Options = {
  input: string | string[]
  preload: string
  outDir: string
}

export default function tsdownPlugin(options: Options): Plugin {
  return {
    name: 'tsdown',
    async configureServer() {
      const {
        input,
        preload,
        outDir,
      } = options

      void tsCompile(input, preload, outDir, () => {
        void spawnElectron()
      })
    },
  }
}
