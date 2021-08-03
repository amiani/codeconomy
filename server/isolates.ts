import { createEffect } from '@javelin/ecs'
import ivm from 'isolated-vm'

export default createEffect(world => {
	const isolates = Array(2).fill(new ivm.Isolate({ memoryLimit: 128 }))
	const contexts = isolates.map(isolate => {
		const context = isolate.createContextSync()
		context.global.setSync('log', (...args: any) => console.log(...args))
		return context
	})

	return () => {
		return { isolates, contexts }
	}
}, { shared: true })