import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { tsdownPlugin, spawnElectron, createDebounced } from './plugins/vite-plugin-run-tsdown'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const startup = createDebounced(spawnElectron)

  return {
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    plugins: [
      vue(),
      tsdownPlugin({
        builds: [
          {
            entry: [
              'electron/main/index.ts',
              'electron/child/*/index.ts',
              'shared/**/*.ts',
              'electron/preload/index.ts',
            ],
            outDir: 'dist-electron',
            target: 'node22',
            fixedExtension: false,
            unbundle: true,
            external: 'electron',
            tsconfig: 'tsconfig.electron.json',
            env: {
              FOO: 'BAR',
            },
            watch: isDev,
            logLevel: isDev ? 'warn' : 'info',
            onSuccess: isDev ? () => void startup() : undefined,
            format: {
              esm: {
                hooks: {
                  "build:done"(ctx) {
                    // remove esm's preload
                    fs.rmSync(
                      path.resolve(ctx.options.outDir, './electron/preload/index.js'),
                      { force: true },
                    )
                  },
                },
              },
              cjs: {
                entry: 'electron/preload/index.ts',
                outDir: 'dist-electron/electron/preload',
                unbundle: false,
                skipNodeModulesBundle: false,
                noExternal: (id) => id.includes('@packages/child-utility'),
              },
            },
          },
        ],
      }),
    ],
  }
})
