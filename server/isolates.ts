import { createEffect } from '@javelin/ecs'
import ivm from 'isolated-vm'

export function createContext(isolate: ivm.Isolate) {
	const context = isolate.createContextSync()
	context.global.setSync('log', (...args: any) => console.log(...args))
	return context
}

export default createEffect(world => {
	const isolates = Array(2).fill(new ivm.Isolate({ memoryLimit: 128 }))

	return () => {
		return isolates
	}
}, { shared: true })