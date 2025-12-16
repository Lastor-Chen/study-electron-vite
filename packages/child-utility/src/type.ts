/* eslint-disable @typescript-eslint/no-explicit-any */

/** 規範現有的 child name */
export type ChildName = string

export type ApiCalls = Record<string, (...args: any[]) => unknown | Promise<unknown>>

export type ApiEvents = Record<string, (...args: any[]) => void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResult<Res = any, E = Error> = Promise<{ result?: Awaited<Res>, error?: E }>

export type ErrorLike = {
	name: string
	message: string
	stack?: string
}

/** 將 ApiCalls 定義的 methods 回傳值全包上 Promise */
export type WrappedCalls<C extends ApiCalls> = {
	[K in keyof C]: C[K] extends (...args: infer P) => infer R
		? (...args: P) => Promise<Awaited<R>>
		: never
}

export type RemoveListener = () => void

export type ChildResponseMessage = Awaited<ApiResult>

export type ChildTriggerMessage = {
	event: string
	args: unknown[]
}

export type ChildCallMessage = {
	childName: string
	id: number
	key: string
	args: unknown[]
}

/** 追加自定義 event */
export interface ChildExtendedEvent {
	// overload
	on(event: string, listener: (...args: any[]) => void): this
	once(event: string, listener: (...args: any[]) => void): this
	removeListener(event: string, listener: (...args: any[]) => void): this

	// custom methods
	postMsg(msgEvent: string, ...args: any[]): void
}

export type IpcChild<C extends ApiCalls, E extends ApiEvents> = {
	invoke<K extends keyof C>(key: Extract<K, string>, ...args: Parameters<C[K]>): ApiResult<ReturnType<C[K]>>
	on<K extends keyof E>(event: Extract<K, string>, listener: (...args: Parameters<E[K]>) => void): void
	once<K extends keyof E>(event: Extract<K, string>, listener: (...args: Parameters<E[K]>) => void): void
	removeListener<K extends keyof E>(event: Extract<K, string>, listener: (...args: Parameters<E[K]>) => void): void
	removeAllListeners<K extends keyof E>(event: Extract<K, string>): void
}

export type WindowIpcChild = {
	postMessage(name: ChildName, key: string, ...args: any[]): ApiResult<unknown, ErrorLike>
	on(name: ChildName, event: string, listener: (...args: any[]) => void): RemoveListener
	onCrash(name: ChildName, listener: (error: ErrorLike) => void): void
}
