import { spawn } from 'node:child_process'
import electronPath from 'electron'

import { cyan } from './simpleColor'

import type { SpawnOptions } from 'node:child_process'

let ab: AbortController | undefined

/**
 * electron argv path 給 `.` 會以 packageJson.main 作為進入點
 * @param argv default is `['.', '--no-sandbox']`
 */
export async function spawnElectron(
  argv = ['.', '--no-sandbox'],
  options?: SpawnOptions,
) {
  await abortElectronIfExit(cyan('[tsdown]'), 'electron restart.')
  ab = new AbortController()

  // 存到 global process 上, 避免 vite config 熱更新時丟失
  process.electronProc = spawn(electronPath as unknown as string, argv, {
    stdio: 'inherit',
    ...options,
    signal: ab.signal,
  })

  process.electronProc.once('close', () => {
    console.log(cyan('[tsdown]'), 'electron process closed.')
    process.exit()
  })

  // 確保只掛一次 onExit, 只有用 q key 關閉 vite 才會觸發
  if (!process.hasHandleExit) {
    process.hasHandleExit = true
    process.once('exit', () => {
      void abortElectronIfExit(cyan('[tsdown]'), 'electron closed.')
    })
  }
}

/** re-spawn 前先 kill 前一個的通用作法 */
function abortElectronIfExit(...msgs: string[]) {
  return new Promise<void>((resolve) => {
    if (process.electronProc) {
      process.electronProc.removeAllListeners('close') // 避免 restart 觸發 onClose
      process.electronProc.once('error', () => {})
      process.electronProc.once('exit', () => {
        console.log(...msgs)
        resolve()
      })

      ab?.abort()
    } else {
      resolve()
    }
  })
}
