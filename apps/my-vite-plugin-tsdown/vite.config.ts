import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { tsdownPlugin } from './plugins/vite-plugin-electron-tsdown'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      tsdownPlugin({
        main: {
          entry: [
            './electron/main/index.ts',
            './electron/child/index.ts',
            './shared/**/*.ts',
          ],
          outDir: './dist-electron',
        },
        preload: {
          entry: './electron/preload/index.cts',
          outDir: './dist-electron/electron/preload',
        },
        watch: ['electron', 'shared'],
        tsconfig: 'tsconfig.electron.json',
      }),
    ],
  }
})
