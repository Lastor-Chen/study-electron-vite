/// <reference types="vite-plugin-electron/electron-env.d.ts" />
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import type { AliasOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { startup } from 'vite-plugin-electron'
import { globSync } from 'glob'

// clear outDir before build
fs.rmSync('dist-electron', { recursive: true, force: true })

const alias: AliasOptions = {
  '@shared': path.resolve(import.meta.dirname, './shared'),
}

// 在 mac 發生過 electron 有監聽 app before-quit 時, 熱重啟會有 error, 需要 hack
// https://github.com/electron-vite/vite-plugin-electron/issues/251
if (process.platform === 'darwin') {
	startup.exit = async () => {
		if (process.electronApp) {
			await new Promise((resolve) => {
				process.electronApp.removeAllListeners()
				process.electronApp.once('exit', resolve)
				process.electronApp.kill()
			})
		}
	}
}

export default defineConfig(() => {
  return {
    resolve: {
      alias,
    },
    plugins: [
      vue(),
      electron({
        main: {
          // https://github.com/vitejs/vite/discussions/8098
          entry: globSync([
            './electron/index.ts',
            './electron/child/**/*.{ts,cts,js,cjs}',
            './shared/**/*.{ts,cts,js,cjs}',
          ]),
          vite: {
            resolve: {
              alias,
            },
            build: {
              ssr: true, // no bundle
              rollupOptions: {
                output: {
                  dir: 'dist-electron',
                  preserveModules: true, // 保留資料夾結構
                },
              },
            },
          },
        },
        preload: {
          input: 'electron/preload.cts',
          vite: {
            resolve: {
              alias,
            },
            esbuild: {
              include: /\.cts$/, // regex or picomatch
            },
            build: {
              minify: false,
              rollupOptions: {
                output: {
                  format: 'cjs',
                  dir: 'dist-electron/electron',
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
