/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
	ChildExtendedEvent,
	ChildCallMessage,
	ChildResponseMessage,
	ApiCalls,
	ApiEvents,
	ChildName,
	IpcChild,
} from '@/type'

// 產生與子程序 two-way 通訊的識別用 id, 確保子程序回應能回對的地方
const requestId = {
	idCounters: {} as { [childName: string]: number | undefined },
	genId(childName: string) {
		const idCounters = requestId.idCounters

		if (typeof idCounters[childName] === 'undefined') {
			idCounters[childName] = 0
		}

		return ++idCounters[childName]
	},
}

/**
 * 提供給 main or child 使用, 需給予不同的 endpoint, 不會 reject.
 * @example
 * // main
 * const child = utilityProcess.fork('/path/to/file')
 * const { result, error } = await invokeChildApi({
 *   endpoint: child,
 *   childName: 'myChild',
 *   key: 'foo',
 *   args: ['arg1', 'arg2'],
 * })
 *
 * // child
 * const { result, error } = await invokeChildApi({
 *   endpoint: process.parentPort,
 *   // ...
 * })
 */
export function invokeChildApi(options: {
	endpoint: (Electron.UtilityProcess | Electron.ParentPort) & ChildExtendedEvent | undefined
	childName: string
	key: string
	args: unknown[]
}) {
	const { endpoint, childName, key, args } = options

	const { promise, resolve } = Promise.withResolvers<ChildResponseMessage>()

	if (!endpoint) {
		resolve({ error: new Error(`Child process ${childName} not found`) })

		return promise
	}

	const id = requestId.genId(childName)

	endpoint.once(`response:api:${id}`, (data: ChildResponseMessage) => {
		// 直接傳 Error 或是 reject 的話 stack 會不完整
		const { error, result } = data
		if (error) return resolve({ error })

		resolve({ result })
	})

	// child 之間互 call 時, main 需要知道目標 childName
	endpoint.postMsg('call:api', { childName, id, key, args } satisfies ChildCallMessage)

	return promise
}

/**
 * 對 child process 添加自定義 `child.postMsg()` 方法，替代原本的 `child.postMessage()`，
 * 使其可用自定義 event 收訊，不再受限於只能用 `"message"` event。
 * @example
 * // 原本被限制只能用 message event, 只能傳一個參數
 * child.postMessage(data)
 * child.on('message', (data) => {})
 *
 * // 使用包裝過的 postMsg 以慣用方式收發 event
 * child.postMsg('event_name', ...args)
 * child.on('event_name', (...args) => {})
 */
export function assignMessageHandler<P extends Electron.UtilityProcess | Electron.ParentPort>(endpoint: P) {
	if (!endpoint || !endpoint['postMessage']) throw new Error('Child process must be an Electron UtilityProcess.')

	const isAssigned = 'postMsg' in endpoint
	if (isAssigned) return endpoint as P & ChildExtendedEvent

	const isUtilityProcess = 'pid' in endpoint
	const eventKeyword = 'message:event'

	// 將 message event 重新 emit 轉發
	endpoint.on('message', (val) => {
		// ParentPort 的傳值會放在 .data
		const msg = isUtilityProcess ? val : val.data

		// 檢查 msg 要符合 type { [eventKeyword: string]: string, args: any[] }
		if (
			typeof msg === 'object' &&
			eventKeyword in msg &&
			typeof msg[eventKeyword] === 'string' &&
			'args' in msg &&
			Array.isArray(msg.args)
		) {
			endpoint.emit(msg[eventKeyword], ...msg.args)
		}
	})

	return Object.assign(endpoint, {
		postMsg(event: string, ...args: any[]) {
			endpoint.postMessage({ [eventKeyword]: event, args })
		},
	}) as P & ChildExtendedEvent
}

/**
 * 包裝出支援 type 自動推斷的子程序高階 IPC channel.
 */
export function wrapIpcChild<C extends ApiCalls, E extends ApiEvents>(
	endpoint: (Electron.UtilityProcess | Electron.ParentPort) & ChildExtendedEvent,
	childName: ChildName,
): IpcChild<C, E> {
	return {
		/** 呼叫 child 定義好的 APIs。 */
		invoke(key, ...args) {
			return invokeChildApi({ endpoint: endpoint, childName, key, args })
		},
		/** on 監聽 child trigger 出的事件。 */
		on(event, listener) {
			endpoint.on(`${childName}:trigger:${event}`, listener)
		},
		/** once 監聽 child trigger 出的事件。 */
		once(event, listener) {
			endpoint.once(`${childName}:trigger:${event}`, listener)
		},
		/** 移除特定 child trigger event listener */
		removeListener(event, listener) {
			endpoint.removeListener(`${childName}:trigger:${event}`, listener)
		},
		/** 移除所有 child trigger event listener */
		removeAllListeners(event) {
			endpoint.removeAllListeners(`${childName}:trigger:${event}`)
		},
	}
}
