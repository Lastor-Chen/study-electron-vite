import { foo } from './utils.js'

console.log('[child] running', foo())

process.parentPort.on('message', (e) => {
  console.log('[child] onMsg:', e)
  process.parentPort.postMessage(`echo ${e.data}`)
})
