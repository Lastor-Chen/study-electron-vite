import { assignMessageHandler } from '@/sharedUtils'

const extendedPort = assignMessageHandler(process.parentPort)

process.on('unhandledRejection', (reason) => {
	let error: Error = new Error(`UnhandledRejection reason ${JSON.stringify(reason)}`)
	if (reason instanceof Error) { error = reason }

	extendedPort.postMsg('system:childCrash', error)
	process.exit(1)
})

process.on('uncaughtException', (err) => {
	extendedPort.postMsg('system:childCrash', err)
	process.exit(1)
})
