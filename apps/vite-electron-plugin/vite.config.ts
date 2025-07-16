import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'
import { dest } from 'vite-electron-plugin/plugin'

// clear outDir before build
fs.rmSync('dist-electron', { recursive: true, force: true })

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@shared': path.resolve(import.meta.dirname, './shared'),
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
        plugins: [
          dest((from, to) => {
            // rename preload extname
            if (from.includes('preload')) {
              to = renameExtTo(to!, '.cjs')
            }

            return to
          }),
        ],
      }),
    ],
  }
})

function renameExtTo(filePath: string, ext: string) {
  const parsed = path.parse(filePath)
  parsed.base = '' // clear basename to avoid overwrite
  parsed.ext = ext
  
  return path.format(parsed)
}
