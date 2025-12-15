import type { WindowIpcChild } from '@/type'

declare global {
	interface Window {
		ipcChild: WindowIpcChild
		allowDevLog: boolean
	}
}
