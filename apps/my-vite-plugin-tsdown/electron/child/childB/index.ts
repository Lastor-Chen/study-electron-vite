import '@packages/child-utility/initChildProcess'
import { bridgeRpcHandler, addConsoleLogPrefix } from '@packages/child-utility/child'

import { rpcHandler } from '@/child/childB/rpcHandler'

addConsoleLogPrefix('[ChildB]')

bridgeRpcHandler(rpcHandler)
