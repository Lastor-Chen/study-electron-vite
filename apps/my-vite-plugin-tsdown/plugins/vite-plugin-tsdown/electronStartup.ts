import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'

import electronPath from 'electron'

let child: ChildProcessWithoutNullStreams | null = null

export function spawnElectron() {
  if (child && !child.killed) {
    child.removeAllListeners() // 避免 restart 觸發 onClose
    child.kill()
  }

  child = spawn(electronPath as unknown as string, ['./dist-electron/electron/main/index.js'])

  child.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  child.stderr.on('data', (data) => {
    console.log(data.toString())
  })

  child.on('close', () => {
    console.log('electron process closed')
    process.exit()
  })
}
