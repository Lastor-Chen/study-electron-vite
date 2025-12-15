export function addConsoleLogPrefix(prefix: string) {
	const log = console.log
	console.log = (...args) => { log(prefix, ...args) }
}
