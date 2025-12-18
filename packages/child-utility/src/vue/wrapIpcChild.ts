/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiCalls, ApiEvents, ChildName, WrappedCalls } from '@/type'

// setup dev logger
window.allowDevLog = import.meta.env.DEV

function logIpcChild(type: 'log' | 'warn' | 'error', ...msgs: unknown[]) {
	if (!window.allowDevLog) return

	console[type](...msgs)
}

/**
 * @example
 * const [myChild, onMyChild, onMyChildCrash] = wrapIpcChild<ChildCalls, ChildEvents>('myChild')
 *
 * // invoke child API
 * try {
 *   const resultData = await myChild.foo('arg1', 'arg2')
 * } catch (err) {
 *   console.log(err)
 * }
 *
 * // listen child trigger event
 * const state = ref()
 * const removeListener = onMyChild('myEvent', (val) => {
 *   state.value = val
 * })
 *
 * // listen child crash
 * onMyChildCrash(() => {
 *   window.alert('myChild process is crashed!!')
 * })
 */
export function wrapIpcChild<C extends ApiCalls, E extends ApiEvents>(childName: ChildName) {
	// 包成 proxy.apiKey() 的呼叫格式
	const proxyPostMessage = new Proxy({} as WrappedCalls<C>, {
		get(target, key: string) {
			return function (...args: any[]): Promise<any> {
				logIpcChild('log', `[${childName}] Call ${String(key)}:`, args)

				return window.ipcChild.postMessage(childName, key, ...args)
					.then(({ error: errorLike, result }) => {
						// IPC 傳 Error 會遺失原始 stack, 主程序先轉成 error-like 最後再轉回 Error
						if (errorLike) {
							logIpcChild('error', `[${childName}] Response ${String(key)}`, errorLike.stack)

							const transError = new Error(errorLike.message)
							transError.stack = errorLike.stack
							throw transError
						}
						logIpcChild('log', `[${childName}] Response ${String(key)}:`, result)

						return result
					})
			}
		},
	})

	/**
	 * Return a remove listener function.
	 * @example
	 * const [, onChild] = wrapIpcChild<ChildCalls, ChildEvents>('myChild')
	 * const removerListener = onChild('myEvent', () => {
	 *   // ...
	 * })
	 * removerListener()
	 */
	const onTriggerMessage = <K extends keyof E>(event: Extract<K, string>, listener: (...args: Parameters<E[K]>) => void) => {
		return window.ipcChild.on(childName, event, listener)
	}

	const onCrash = (listener: (error: Error) => void) => {
		window.ipcChild.onCrash(childName, (errorLike) => {
			const error = new Error(errorLike.message)
			error.stack = errorLike.stack
			listener(error)
		})
	}

	return [proxyPostMessage, onTriggerMessage, onCrash] as const
}
