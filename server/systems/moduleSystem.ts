import { World, createQuery, Entity, toComponent, useInterval } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import {
	Body,
	Module,
	Action,
	Health,
	Allegiance,
	Transform,
	Isolate,
	CombatHistory
} from '../components'
import { useClients } from "../effects"
import { MAX_PLAYERS } from "../env"
import { logTopic, scriptTopic } from "../topics"
import { LogType } from "../topics/logTopic"

const moduleShipQuery = createQuery(Module, Body, Action, Allegiance)
const shipQuery = createQuery(CombatHistory, Transform, Allegiance, Health)

function createState(
	body: typeof rapier.RigidBody,
	allies: Array<ShipState>,
	enemies: Array<ShipState>,
) {
	return {
		self: {
			position: body.translation(),
			velocity: body.linvel(),
			rotation: body.rotation(),
			angularVelocity: body.angvel(),
		},
		allies,
		enemies,
	}
}

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

export default function moduleSystem(world: World) {
	const update = useInterval(1000 / 10)
	const clients = useClients()

	for (const scriptEvent of scriptTopic) {
		const playerEntity = clients.getPlayer(scriptEvent.uid)
		try {
			const isolate = world.get(playerEntity, Isolate) as ivm.Isolate
			try {
				const module = isolate.compileModuleSync(scriptEvent.code)
				const testContext = isolate.createContextSync()
				module.instantiateSync(testContext, (specifier, referrer) => module)
				module.evaluateSync()
				const main = module.namespace.getSync('default')
				if (main instanceof Function) {
					world.attach(playerEntity, toComponent(module, Module))
					console.log(`Module arrived for player entity ${playerEntity}`)
				} else {
					logTopic.push({
						type: LogType.Error,
						toEntity: playerEntity,
						message: `Module did not export a default function`
					})
					console.error(`Module did not export a function`)
				}
			} catch (err) {
				logTopic.push({
					type: LogType.Error,
					toEntity: playerEntity,
					message: `Module failed to compile: ${err}`
				})
			}
		} catch (e) {
			console.log(e)
		}
	}

	if (update) {
		//Maybe use number of connected players instead of MAX_PLAYERS
		const shipStates = Array<Map<Entity, ShipState>>(MAX_PLAYERS)
		for (let i = 0; i < MAX_PLAYERS; i++) {
			shipStates[i] = new Map()
		}
		shipQuery((e, [combatHistory, transform, allegiance, health]) => {
			shipStates[allegiance.team].set(e, {
				position: { x: transform.x, y: transform.y },
				rotation: transform.rotation,
				health: health.current,
				team: allegiance.team,
			})
		})
		moduleShipQuery(async (e, [moduleComp, bodyComp, action, allegiance]) => {
			const body = bodyComp as typeof rapier.Body
			const module = moduleComp as ivm.Module
			const allies = Array<ShipState>()
			for (const [shipEntity, state] of shipStates[allegiance.team].entries()) {
				if (shipEntity !== e) {
					allies.push(state)
				}
			}
			const enemies = []
			for (let i = 0, n = shipStates.length; i < n; ++i) {
				if (i !== allegiance.team) {
					enemies.push(...shipStates[i].values())
				}
			}
			const state = createState(body, allies, enemies)
			try {
				const main = await module.namespace.get('default')
				const nextAction = await main(state)
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
}