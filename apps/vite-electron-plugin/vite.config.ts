import { rmSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'

// clear outDir before build
rmSync('dist-electron', { recursive: true, force: true })

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      electron({
        include: ['electron'],
        transformOptions: {
          format: 'esm',
          target: 'node22',
        },
      }),
    ],
  }
})
