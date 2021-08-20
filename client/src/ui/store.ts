import merge from 'mergerino'
import flyd from 'flyd'

const store = {
	initial: {
		user: {
			token: '',
		},
		editor: {
			code: ''
		},
		scores: {},
	},

	Actions: (update: flyd.Stream<any>) => ({
		setCode: (code: string) => {
			update({ editor: { code } })
			localStorage.setItem('code', code)
		},
		setToken: (token: string) => update({ user: { token } }),
	}),

	Effects: (update: flyd.Stream<any>, actions: any) => [
	]
}

const update = flyd.stream<any>()
const states = flyd.scan(merge, store.initial, update)
const actions = store.Actions(update)
const effects = store.Effects(update, actions)
//@ts-ignore
states.map(state => effects.forEach(effect => effect(state)))

export { states, actions }