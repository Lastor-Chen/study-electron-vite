import path from 'node:path'
import { spawn } from 'child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'

import { build as tsBuild } from 'tsdown'
import electronPath from 'electron'
import type { Plugin } from 'vite'

async function tsCompile(file: string, preload: string, outDir: string) {
  // compile main
  await tsBuild({
    target: ['node22'],
    outDir: outDir,
    external: 'electron',
    tsconfig: 'tsconfig.electron.json',
    config: false,

    entry: [file, `!${preload}`],
    format: ['esm'],
  })

  // compile preload
  await tsBuild({
    target: ['node22'],
    outDir: outDir,
    external: 'electron',
    tsconfig: 'tsconfig.electron.json',
    config: false,

    entry: preload,
    format: ['cjs'],
    clean:false
  })

  console.log('compile ok')
}

let child: ChildProcessWithoutNullStreams | null = null

function spawnElectron() {
  if (child && !child.killed) {
    child.removeAllListeners() // 避免 restart 觸發 onClose
    child.kill()
  }

  child = spawn(electronPath as unknown as string, ['./dist-electron/index.js'])

  child.stdout.on('data', (data) => {
    console.log('stdout:', data.toString())
  })

  child.stderr.on('data', (data) => {
    console.log('stderr:', data.toString())
  })

  child.on('close', () => {
    console.log('child closed')
  })
}

export type Options = {
  input: string
  preload: string
  outDir: string
}

export default function tsdownPlugin(options: Options): Plugin {
  return {
    name: 'tsdown',
    async configureServer(server) {
      const {
        input,
        preload,
        outDir,
      } = options

      const targetDir = path.join(process.cwd(), input)
      console.log('targetDir', targetDir)

      await tsCompile(input, preload, outDir)
      spawnElectron()

      server.watcher.on('all', async (event, filePath) => {
        if (filePath.startsWith(targetDir)) {
          console.log({ event, filePath })
          // TODO 只編譯有變更的檔案
          await tsCompile(input, preload, outDir)
          spawnElectron()
        }
      })
    }
  }
}
