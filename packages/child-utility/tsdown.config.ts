import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

const baseConfig: UserConfig = {
  fixedExtension: false,
  unbundle: true,
  dts: true,
  external: ['electron', 'vue'],
  skipNodeModulesBundle: false,
}

export default defineConfig([
  {
    ...baseConfig,
    name: 'main',
    entry: [
      './src/electron/main/index.ts',
      './src/electron/child/index.ts',
      './src/electron/child/initProcess.ts',
    ],
    outDir: './dist/electron',
    format: ['esm'],
    tsconfig: 'tsconfig.node.json',
  },
  {
    ...baseConfig,
    name: 'preload',
    entry: ['./src/preload/index.ts'],
    outDir: './dist/preload',
    format: ['esm'],
    tsconfig: 'tsconfig.preload.json',
  },
  {
    ...baseConfig,
    name: 'renderer',
    entry: ['./src/vue/index.ts'],
    outDir: './dist/vue',
    format: ['esm'],
    outputOptions: {
      preserveModulesRoot: 'src/vue',
    },
    tsconfig: 'tsconfig.renderer.json',
  },
])
