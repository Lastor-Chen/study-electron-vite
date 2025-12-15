import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    name: 'main',
    entry: [
      './src/index.ts',
    ],
    outDir: './dist',
    format: ['esm'],
    fixedExtension: false,
    unbundle: true,
    skipNodeModulesBundle: true,
    external: ['electron', 'vue'],
  },
])
