import { createTrigger } from '@packages/child-utility/child'

import { ChildACalls, ChildAEvents } from '@shared/childA/type'

const trigger = createTrigger<ChildAEvents>()

export const rpcHandler: ChildACalls = {
  ping() {
    const random = Date.now().toString(16)
    const result = `childA ${random}`

    trigger('updatePing', result)

    return result
  },
}
