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
        input: [
          './electron/main/index.ts',
          './electron/child/index.ts',
          './shared/**/*.ts',
        ],
        outDir: './dist-electron',
        preload: './electron/preload/index.cts',
      }),
    ],
  }
})
