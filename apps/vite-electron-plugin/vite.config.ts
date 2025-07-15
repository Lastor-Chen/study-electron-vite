import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'

// clear outDir before build
rmSync('dist-electron', { recursive: true, force: true })

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@shared': resolve(import.meta.dirname, './shared'),
      },
    },
    plugins: [
      vue(),
      electron({
        include: ['electron', 'shared'],
        transformOptions: {
          format: 'esm',
          target: 'node22',
        },
      }),
    ],
  }
})
