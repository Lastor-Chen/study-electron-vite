console.log('child running')

process.parentPort.on('message', (e) => {
  console.log('[child] onMsg:', e)
  process.parentPort.postMessage(`echo ${e.data}`)
})
