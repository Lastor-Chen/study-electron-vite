import { assignMessageHandler, wrapIpcChild } from '@/electron/sharedUtils'

import type {
	ChildCallMessage,
	ChildResponseMessage,
	ChildTriggerMessage,
	ApiCalls,
	ApiEvents,
	ChildName,
} from '@/type'

const _extendedPort = assignMessageHandler(process.parentPort)

/**
 * 橋接子程序暴露的 APIs 給主程序進行遠端呼叫。
 * @example
 * bridgeRpcHandler({
 *   foo(txt: string) { return `Hello ${txt}` },
 *   // ...
 * })
 */
export function bridgeRpcHandler(exposedApi: ApiCalls) {
	const postResponse = (id: number, response: ChildResponseMessage) => {
		_extendedPort.postMsg(`response:api:${id}`, response)
	}

	_extendedPort.on('call:api', async (msg: ChildCallMessage) => {
		const { id, key, args } = msg

		if (typeof exposedApi[key] !== 'function')
			return postResponse(id, { error: new Error(`Key "${key}" not found`) })

		try {
			const result = await exposedApi[key](...args)
			postResponse(id, { result })
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err))
			postResponse(id, { error })
		}
	})
}

/**
 * 建立與其他子程序通訊的接口。
 * @example
 * const ipcMyChild = createIpcChild<ChildCalls, ChildEvents>('myChild')
 *
 * // Invoke APIs
 * const { result, error } = await ipcMyChild.invoke('api_key', 'arg1', 'arg2')
 *
 * // Listen trigger event
 * const listener = (val) => {}
 * ipcMyChild.on('myEvent', listener)
 * ipcMyChild.removeListener('myEvent', listener)
 * ipcMyChild.removeAllListeners('myEvent')
 */
export function createIpcChild<C extends ApiCalls, E extends ApiEvents>(childName: ChildName) {
	return wrapIpcChild<C, E>(_extendedPort, childName)
}

/**
 * 建立當前 child 包含 type 自動推斷 trigger event 的 factory function.
 * trigger 會發送 data 更新事件給 main 再轉發給 browser 與其他 child.
 * @example
 * const trigger = createTrigger<ChildEvents>()
 * trigger('myEvent', 'val1', 'val2')
 */
export function createTrigger<E extends ApiEvents>() {
	return function trigger<K extends keyof E>(event: Extract<K, string>, ...args: Parameters<E[K]>) {
		_extendedPort.postMsg('trigger', { event, args } satisfies ChildTriggerMessage)
	}
}
