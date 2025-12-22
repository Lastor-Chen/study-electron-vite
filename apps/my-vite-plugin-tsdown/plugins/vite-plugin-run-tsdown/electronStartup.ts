import { spawn } from 'node:child_process'
import electronPath from 'electron'

import { cyan } from './simpleColor'

import type { SpawnOptions } from 'node:child_process'

/**
 * electron argv path 給 `.` 會以 packageJson.main 作為進入點
 * @param argv default is `['.', '--no-sandbox']`
 */
export async function spawnElectron(
  argv = ['.', '--no-sandbox'],
  options?: SpawnOptions,
) {
  await abortElectronIfExist(cyan('[tsdown]'), 'electron restart.')
  process.ab = new AbortController()

  // 存到 global process 上, 避免 vite config 熱更新時丟失
  process.electronProc = spawn(electronPath as unknown as string, argv, {
    stdio: 'inherit',
    ...options,
    signal: process.ab.signal,
  })

  process.electronProc.once('close', () => {
    console.log(cyan('[tsdown]'), 'electron process closed.')
    process.exit()
  })

  // 確保只掛一次 onExit, 只有用 q key 關閉 vite 才會觸發
  if (!process.hasHandleExit) {
    process.hasHandleExit = true
    process.once('exit', () => {
      void abortElectronIfExist(cyan('[tsdown]'), 'electron closed.')
    })
  }

  return process.electronProc
}

/** re-spawn 前先 kill 前一個的通用作法 */
export function abortElectronIfExist(...msgs: string[]) {
  return new Promise<void>((resolve) => {
    if (process.electronProc) {
      process.electronProc.removeAllListeners('close') // 避免 restart 觸發 onClose
      process.electronProc.once('error', () => {})
      process.electronProc.once('exit', () => {
        console.log(...msgs)
        resolve()
      })

      process.ab?.abort()
    } else {
      resolve()
    }
  })
}

// bk
export function createDebounced<T extends (...args: any[]) => any>(fn: T, delay = 100) {
  let timer: NodeJS.Timeout | undefined
  let resolves: ((value: Awaited<ReturnType<T>> | null) => void)[] = []

  return function(...args: any[]) {
    clearTimeout(timer)
    resolves.forEach((r) => r(null))
    resolves = []

    const { promise, resolve } = Promise.withResolvers<Awaited<ReturnType<T>> | null>()
    resolves.push(resolve)

    timer = setTimeout(async () => {
      timer = undefined
      const res = await fn(...args)
      resolve(res)
    }, delay)

    return promise
  }
}
