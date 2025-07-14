import { rmSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'

// clear outDir before build
rmSync('dist-electron', { recursive: true, force: true })

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      electron({
        main: {
          entry: 'electron/index.ts',
          vite: {
            build: {
              ssr: true, // no bundle
            },
          },
        },
        preload: {
          input: 'electron/preload.cts',
          vite: {
            build: {
              minify: false,
              rollupOptions: {
                output: {
                  // 預設 type module 會被輸出成 .mjs, 要手動指定
                  entryFileNames: '[name].cjs',
                },
              },
            }
          },
        },
      }),
    ],
  }
})
