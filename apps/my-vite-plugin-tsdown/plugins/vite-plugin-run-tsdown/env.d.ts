import type { ChildProcess } from 'node:child_process'

declare global {
  namespace NodeJS {
    interface Process {
      electronProc: ChildProcess | undefined
      hasHandleExit: boolean | undefined
      isTsdownWatched: boolean | undefined
      ab: AbortController | undefined
    }
  }
}
