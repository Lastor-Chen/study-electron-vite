import { createIpcChild } from '@packages/child-utility/child'

import type { ChildBCalls } from '@shared/childB/type'
import type { ChildACalls, ChildAEvents } from '@shared/childA/type'

const childA = createIpcChild<ChildACalls, ChildAEvents>('childA')

export const rpcHandler: ChildBCalls = {
  async callChildA() {
    const { result, error } = await childA.invoke('ping')
    if (error) throw error

    return result!
  },
}
