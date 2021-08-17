import { World, createQuery, Entity, toComponent } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import {
	Body,
	Script,
	Context,
	Action,
	Health,
	Allegiance,
	Transform,
	Isolate,
	CombatHistory
} from '../components'
import { useClients } from "../effects"
import { MAX_PLAYERS } from "../env"
import { scriptTopic } from "../topics"
//import { usePlayers } from "./netSystem"

const scriptShips = createQuery(Script, Context, Body, Action, Allegiance)
const ships = createQuery(CombatHistory, Transform, Allegiance, Health)

const createState = (
	body: typeof rapier.RigidBody,
	allies: Array<ShipState>,
	enemies: Array<ShipState>,
) => ({
	position: body.translation(),
	velocity: body.linvel(),
	rotation: body.rotation(),
	angularVelocity: body.angvel(),
	allies,
	enemies,
})

interface ShipState {
	position: { x: number, y: number },
	rotation: number,
	health: number,
	team: number,
}

interface Action {
	throttle: number,
	rotate: number,
	fire: boolean,
}

export default function scriptSystem(world: World) {
	const clients = useClients()
	for (const scriptEvent of scriptTopic) {
		const player = clients.getPlayer(scriptEvent.uid)
		try {
			const isolate = world.get(player, Isolate) as ivm.Isolate
			const script = isolate.compileScriptSync(scriptEvent.code)
			world.attach(player, toComponent(script, Script))
			console.log(`Script arrived for player entity ${player}`)
		} catch (e) {
			console.log(e)
		}
	}

	//Maybe use number of connected players instead of MAX_PLAYERS
	const shipStates = Array<Map<Entity, ShipState>>(MAX_PLAYERS).fill(new Map<Entity, ShipState>())
	ships((e, [combatHistory, transform, allegiance, health]) => {
		shipStates[allegiance.team].set(e, {
			position: { x: transform.x, y: transform.y },
			rotation: transform.rotation,
			health: health.current,
			team: allegiance.team,
		})
	})
	scriptShips(async (e, [script, contextComp, bodyComp, action, allegiance]) => {
		const body = bodyComp as typeof rapier.Body
		const context = contextComp as ivm.Context
		const allies: Array<ShipState> = []
		for (const [shipEntity, state] of shipStates[allegiance.team].entries()) {
			if (shipEntity !== e) {
				allies.push(state)
			}
		}
		const enemies = [...shipStates[1 - allegiance.team].values()]
		console.log(enemies.length)
		const state = createState(body, allies, enemies)
		await context.global.set('state', state, { copy: true })
		try {
			const nextAction: Action = await context.eval(`run(state)`, { copy: true })
			if (nextAction) {
				action.throttle = nextAction.throttle ? nextAction.throttle : 0
				action.rotate = nextAction.rotate ? nextAction.rotate : 0
				action.fire = nextAction.fire ? nextAction.fire : false
			}
		} catch (error) {
			console.log(`${e} threw ${error}`)
		}
	})

	/*
	isolates((e, [isolateComp]) => {
		//do something with cputime
	})
	*/
}