import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  format: ['esm'],
  dts: true,
  fixedExtension: false,
  external: [
    'tsdown',
    'vite',
    'electron'
  ],
  unbundle: true,
  skipNodeModulesBundle: true,
})
