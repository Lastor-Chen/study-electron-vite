import type { ChildProcess } from 'node:child_process'

declare global {
  namespace NodeJS {
    interface Process {
      /** Internal state used by vite-plugin-run-tsdown. */
      _vpt: {
        electronProc?: ChildProcess
        hasHandleExit?: boolean
        isTsdownWatched?: boolean
        ab?: AbortController
      }
    }
  }
}
