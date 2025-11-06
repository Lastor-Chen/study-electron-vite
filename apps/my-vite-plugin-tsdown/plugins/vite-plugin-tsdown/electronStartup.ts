import { spawn } from 'node:child_process'
import type { ChildProcess, SpawnOptions } from 'node:child_process'

import electronPath from 'electron'

let electronProc: ChildProcess | null = null

/**
 * electron argv path 給 `.` 會以 packageJson.main 作為進入點
 * @param argv default is `['.', '--no-sandbox']`
 */
export async function spawnElectron(
  argv = ['.', '--no-sandbox'],
  options?: SpawnOptions,
) {
  await killElectronIfExist()

  electronProc = spawn(electronPath as unknown as string, argv, {
    stdio: 'inherit',
    ...options,
  })

  electronProc.once('close', () => {
    console.log('electron process closed')
    process.exit()
  })
}

async function killElectronIfExist() {
  if (electronProc && !electronProc.killed) {
    await new Promise((resolve) => {
      electronProc!.removeAllListeners() // 避免 restart 觸發 onClose
      electronProc!.once('exit', resolve)
      electronProc!.kill()
    })
  }
}
