import '@packages/child-utility/initChildProcess'
import { bridgeRpcHandler, addConsoleLogPrefix } from '@packages/child-utility/child'

import { rpcHandler } from '@/child/childA/rpcHandler'

addConsoleLogPrefix('[ChildA]')

bridgeRpcHandler(rpcHandler)
