import merge from 'mergerino'
import flyd from 'flyd'

import { GameState, Score } from './GameState'
import { DebugState } from './DebugState'

export interface AppState {
	user: any,
	editor: any,
	game: GameState,
	debug: DebugState,
}

const initial: AppState = {
	user: {
		token: '',
	},
	editor: {
		code: '',
	},
	game: {
		scores: [],
		timer: 180,
	},
	debug: {
		downloadRate: 0,
		tick: 0,
	}
}

const store = {
	initial,

	Actions: (update: flyd.Stream<any>) => ({
		setCode: (code: string) => {
			update({ editor: { code } })
			localStorage.setItem('code', code)
		},
		setToken: (token: string) => update({ user: { token } }),
		setScores: (scores: Array<Score>) => update({ game: { scores } }),
		setRate: (downloadRate: number) => update({ debug: { downloadRate } }),
		setTick: (tick: number) => update({ debug: { tick } }),
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