import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { tsdownPlugin, spawnElectron } from './plugins/vite-plugin-run-tsdown'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      vue(),
      tsdownPlugin({
        shared: {
          target: 'node22',
          tsconfig: 'tsconfig.electron.json',
          external: 'electron',
          fixedExtension: false,
          watch: isDev ? ['electron', 'shared'] : undefined,
          logLevel: isDev ? 'warn' : 'info',
          env: {
            FOO: 'BAR',
          },
        },
        builds: [
          {
            name: 'Main',
            entry: [
              './electron/main/index.ts',
              './electron/child/index.ts',
              './shared/**/*.ts',
            ],
            outDir: './dist-electron',
            format: 'esm',
            unbundle: true,
          },
          {
            name: 'Preload',
            entry: './electron/preload/index.cts',
            outDir: './dist-electron/electron/preload',
            format: 'cjs',
            onSuccess(_, signal) {
              void spawnElectron(['.', '--no-sandbox'], { signal })
            },
          },
        ],
      }),
    ],
  }
})
