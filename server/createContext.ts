import { ComponentOf } from '@javelin/ecs'
import ivm from 'isolated-vm'
import { Log } from './components'

export default function createContext(
	isolate: ivm.Isolate,
	log: ComponentOf<typeof Log>
): ivm.Context {
	const context = isolate.createContextSync()
	context.global.setSync('log', (...args: any) => {
		log.logs.push(args)
	})
	return context
}