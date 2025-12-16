import { createChildRef } from '@packages/child-utility/vue'
import type { ChildACalls, ChildAEvents } from '@shared/childA/type'

export const childARef = createChildRef<ChildACalls, ChildAEvents>('childA')
