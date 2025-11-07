import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tsdownPlugin from './plugins/vite-plugin-tsdown'

export default defineConfig(() => {
  return {
    // electron 是走 file:// 協定, 要給相對路徑
    base: './',
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
      }),
    ],
  }
})
