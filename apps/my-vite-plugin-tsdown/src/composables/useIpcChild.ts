import { wrapIpcChild } from '@packages/child-utility/vue'

import type { ChildACalls, ChildAEvents } from '@shared/childA/type'
import type { ChildBCalls, ChildBEvents } from '@shared/childB/type'

const [childA, onChildA, onChildACrash] = wrapIpcChild<ChildACalls, ChildAEvents>('childA')
const [childB, onChildB, onChildBCrash] = wrapIpcChild<ChildBCalls, ChildBEvents>('childB')

export function useChildA() {
  return { childA, onChildA, onChildACrash }
}

export function useChildB() {
  return { childB, onChildB, onChildBCrash }
}
