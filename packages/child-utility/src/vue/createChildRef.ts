import { computed, shallowRef } from 'vue'

import { wrapIpcChild } from '@/vue/wrapIpcChild'

import type { ComputedRef } from 'vue'
import type { ApiCalls, ApiEvents, ChildName } from '@/type'

/**
 * 建立子程序 trigger 自動更新的 ref。
 * 需要 initCall 的回傳值與 trigger event callback 的參數值 type 一致，
 * 且子程序發出的 trigger 只接受第一個參數。
 * @example
 * const childRef = createChildRef<ChildCalls, ChildEvents>('myChild')
 *
 * // Only update when child trigger
 * const countState = childARef('updateCount')
 *
 * // Call API when create with default value
 * const countState = childARef('updateCount', { initCall: 'getCount', initValue: 0 })
 */
export function createChildRef<C extends ApiCalls, E extends ApiEvents>(childName: ChildName) {
	return function childRef<
		EKey extends keyof E,
		CKey extends keyof C,
		InitV extends Parameters<E[EKey]>[0] | undefined,
	>(
		event: Extract<EKey, string>,
		options?: {
			initCall?: CKey
			initValue?: InitV
		},
	): ComputedRef<InitV extends undefined ? Parameters<E[EKey]>[0] | undefined : Parameters<E[EKey]>[0]> {
		const [child, onChild] = wrapIpcChild<C, E>(childName)
		const state = shallowRef(options?.initValue)

		onChild(event, (...args) => {
			state.value = args[0]
		})

		if (options?.initCall) {
			child[options.initCall]().then((val) => {
				state.value = val
			}).catch(() => { /* ignore */ })
		}

		return computed(() => state.value)
	}
}
