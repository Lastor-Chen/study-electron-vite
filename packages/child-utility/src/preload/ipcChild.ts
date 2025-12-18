/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer, contextBridge } from 'electron'

import type { IpcRendererEvent } from 'electron'
import type { ErrorLike, WindowIpcChild } from '@/type'

export function bridgeIpcChild() {
	/** 紀錄已經 crash 的子程序 */
	const crashedChildMap: Record<string, ErrorLike> = {}

	// 負責紀錄 crash 狀態
	ipcRenderer.on('system:childCrash', (_, errorLike: ErrorLike, childName: string) => {
		crashedChildMap[childName] = errorLike
	})

	contextBridge.exposeInMainWorld('ipcChild', {
		postMessage(childName, key, ...args) {
			return ipcRenderer.invoke('invoke-child', childName, key, ...args)
		},
		on(childName, event, listener) {
			const channel = `${childName}:trigger:${event}`
			const cb = (_ev: IpcRendererEvent, ...args: any[]) => { listener(...args) }

			ipcRenderer.on(channel, cb)

			return () => { ipcRenderer.removeListener(channel, cb) }
		},
		onCrash(childName, listener) {
			ipcRenderer.on('system:childCrash', (_, errorLike, crashedChildName) => {
				if (childName !== crashedChildName) return
				listener(errorLike)
			})

			// 在 crash 之後才掛監聽, 會走這
			if (childName in crashedChildMap) {
				const errorLike = crashedChildMap[childName]
				if (errorLike) { listener(errorLike) }
			}
		},
	} satisfies WindowIpcChild)
}
