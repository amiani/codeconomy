import { World, createQuery, Entity, toComponent } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import {
	Body,
	Script,
	Context,
	Action,
	Ship,
	Health,
	Team,
	Transform,
	Isolate
} from '../components'
import { scriptTopic } from "../topics"
import { usePlayers } from "./netSystem"

const scriptShips = createQuery(Script, Context, Body, Action, Team)
const ships = createQuery(Ship, Transform, Team, Health)
const isolates = createQuery(Isolate)

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
	const players = usePlayers()
	for (const scriptEvent of scriptTopic) {
		const e = players.get(scriptEvent.uid)
		try {
			const isolate = world.get(e, Isolate) as ivm.Isolate
			const script = isolate.compileScriptSync(scriptEvent.code)
			world.attach(e, toComponent(script, Script))
			console.log(`Script arrived for player entity ${e}`)
		} catch (e) {
			console.log(e)
		}
	}

	const shipStates: Array<Map<Entity, ShipState>> = [new Map(), new Map()];
	ships((e, [ship, transform, team, health]) => {
		shipStates[team.id].set(e, {
			position: { x: transform.x, y: transform.y },
			rotation: transform.rotation,
			health: health.current,
			team: team.id,
		})
	})
	scriptShips(async (e, [script, contextComp, bodyComp, action, team]) => {
		const body = bodyComp as typeof rapier.Body
		const context = contextComp as ivm.Context
		const allies: Array<ShipState> = []
		for (const [shipEntity, state] of shipStates[team.id].entries()) {
			if (shipEntity !== e) {
				allies.push(state)
			}
		}
		const enemies = [...shipStates[1 - team.id].values()]
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