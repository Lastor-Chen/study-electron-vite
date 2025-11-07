import { spawn } from 'node:child_process'
import type { ChildProcess, SpawnOptions } from 'node:child_process'

import electronPath from 'electron'

declare global {
  namespace NodeJS {
    interface Process {
      electronProc: ChildProcess | undefined
    }
  }
}

/**
 * electron argv path 給 `.` 會以 packageJson.main 作為進入點
 * @param argv default is `['.', '--no-sandbox']`
 */
export async function spawnElectron(
  argv = ['.', '--no-sandbox'],
  options?: SpawnOptions,
) {
  await killElectronIfExist()

  // 存到 global process 上, 避免 vite config 熱更新時丟失
  process.electronProc = spawn(electronPath as unknown as string, argv, {
    stdio: 'inherit',
    ...options,
  })

  process.electronProc.once('close', () => {
    console.log('electron process closed')
    process.exit()
  })
}

async function killElectronIfExist() {
  await new Promise<void>((resolve) => {
    if (process.electronProc && !process.electronProc.killed) {
      process.electronProc.removeAllListeners() // 避免 restart 觸發 onClose
      process.electronProc.once('exit', resolve)
      process.electronProc.kill()
    } else {
      resolve()
    }
  })
}
