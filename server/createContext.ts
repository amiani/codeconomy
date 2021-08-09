import ivm from 'isolated-vm'

export default function createContext(isolate: ivm.Isolate): ivm.Context {
	const context = isolate.createContextSync()
	context.global.setSync('log', (...args: any) => console.log(...args))
	return context
}