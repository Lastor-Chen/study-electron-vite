import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { tsdownPlugin, spawnElectron } from './plugins/vite-plugin-run-tsdown'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    plugins: [
      vue(),
      tsdownPlugin({
        shared: {
          target: 'node22',
          tsconfig: 'tsconfig.electron.json',
          external: 'electron',
          fixedExtension: false,
          watch: isDev ? true : undefined,
          logLevel: isDev ? 'warn' : 'info',
          env: {
            FOO: 'BAR',
          },
          onSuccess: isDev ? () => spawnElectron() : undefined
        },
        builds: [
          {
            name: 'Main',
            entry: [
              './electron/main/index.ts',
              './electron/child/*/index.ts',
              './shared/**/*.ts',
            ],
            outDir: './dist-electron',
            format: 'esm',
            unbundle: true,
          },
          {
            name: 'Preload',
            entry: './electron/preload/index.ts',
            outDir: './dist-electron/electron/preload',
            format: 'cjs',
            noExternal: ['@packages/child-utility/preload'],
          },
        ],
      }),
    ],
  }
})
