import { utilityProcess, ipcMain, BrowserWindow } from 'electron'

import { invokeChildApi, assignMessageHandler, wrapIpcChild } from '@/electron/sharedUtils'

import type {
	ChildName,
	ApiCalls,
	ApiEvents,
	ErrorLike,
	ChildResponseMessage,
	ChildTriggerMessage,
	ChildCallMessage,
	ChildExtendedEvent,
} from '@/type'

/**
 * 蒐集 child record. (選用 Map 而非 object 是為了語意化 get, set, 並且可 forEach)
 */
const childMap = new Map<string, Electron.UtilityProcess & ChildExtendedEvent>()

// 註冊 from browser call child 的通訊監聽
ipcMain.handle('invoke-child', async (_event, name: string, key: string, ...args) => {
	const endpoint = childMap.get(name)
	const { result, error } = await invokeChildApi({ endpoint, childName: name, key, args })

	// 直接傳 Error 到 browser, error.stack 會被 format 掉, 轉成 error-like object
	if (error) return {
		error: { name: error.name, message: error.message, stack: error.stack } satisfies ErrorLike,
	}

	return { result }
})

/**
 * fork a electron UtilityProcess and setup it.
 * 要新增子程序時，需手動給 type ChildName 添加新名稱。
 * @example
 * // child index.js
 * import '@common/childUtility/child/initProcess'
 * import { bridgeRpcHandler } from '@common/childUtility/child'
 * bridgeRpcHandler({
 *   foo(txt: string) { return `Hello ${txt}` },
 *   // ...
 * })
 *
 * // main index.js
 * const myChild = forkChild('myChild', '/path/to/child/index.js')
 * const { result, error } = await myChild.invoke('foo', 'Child')
 * console.log(result) // "Hello Child"
 *
 * const listener = (val) => {}
 * myChild.on('myEvent', listener)
 * myChild.removeListener('myEvent', listener)
 * myChild.removeListener('myEvent') // remove all
 * @param name child process name
 * @param modulePath entry file absolute path
 * @param argv process.argv
 */
export function forkChild<C extends ApiCalls, E extends ApiEvents>(name: ChildName, modulePath: string, argv = [], options?: Electron.ForkOptions) {
	const child = utilityProcess.fork(modulePath, argv, options)
	const extendedChild = assignMessageHandler(child)
	childMap.set(name, extendedChild)

	//#region lifecycle 監聽
	child.on('spawn', () => console.log(`Child Process [${name}] is running`))

	child.on('error', (...args) => { // V8 出問題才會被觸發
		console.log(`${name} error`, { type: args[0], location: args[1], report: args[2] })
	})

	child.on('exit', (code) => {
		console.log(`Child Process [${name}] exited with code ${code}`)
	})

	extendedChild.on('system:childCrash', (err: Error) => {
		console.log(`[${name}Crashed]`, err)

		const errorLike: ErrorLike = { name: err.name, message: err.message, stack: err.stack }
		BrowserWindow.getAllWindows().forEach((browser) => {
			browser.webContents.send('system:childCrash', errorLike, name)
		})
	})
	//#endregion lifecycle 監聽

	extendedChild.on('call:api', async (msg: ChildCallMessage) => {
		const { childName, id, key, args } = msg
		const endpoint = childMap.get(childName)

		const res = await invokeChildApi({ endpoint, childName, key, args })
		extendedChild.postMsg(`response:api:${id}`, res satisfies ChildResponseMessage)
	})

	extendedChild.on('trigger', (msg: ChildTriggerMessage) => {
		const { event, args } = msg

		// 轉發獨立事件給 main 監聽使用
		extendedChild.emit(`${name}:trigger:${event}`, ...args)

		// 通知所有子程序
		childMap.forEach((proc) => {
			proc.postMsg(`${name}:trigger:${event}`, ...args)
		})

		// 通知所有 browser
		BrowserWindow.getAllWindows().forEach((browser) => {
			browser.webContents.send(`${name}:trigger:${event}`, ...args)
		})
	})

	const ipcChild = wrapIpcChild<C, E>(extendedChild, name)

	return {
		process: extendedChild,
		...ipcChild,
	}
}
