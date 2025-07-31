import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
  return {
    // electron 是走 file:// 協定, 要給相對路徑
    base: './',
    plugins: [
      vue(),
    ],
  }
})
