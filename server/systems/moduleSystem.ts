import { World, createQuery, Entity, toComponent, useInterval, component } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import {
	Body,
	Module,
	Command,
	Health,
	Allegiance,
	Transform,
	Isolate,
	CombatHistory,
	Code
} from '../components'
import { useClients } from "../effects"
import { MAX_PLAYERS } from "../env"
import { createObservation } from "../factories"
import { ShipObservation } from "../factories/createObservation"
import { logTopic, moduleTopic } from "../topics"
import { LogType } from "../topics/logTopic"

const moduleShipQuery = createQuery(Module, Body, Command, Allegiance)
const shipQuery = createQuery(CombatHistory, Transform, Allegiance, Health)

export default function moduleSystem(world: World) {
	const update = useInterval(1000 / 10)
	const clients = useClients()

	for (const moduleEvent of moduleTopic) {
		const playerEntity = clients.getPlayer(moduleEvent.uid)
		try {
			const isolate = world.get(playerEntity, Isolate) as ivm.Isolate
			if (validateModule(isolate, moduleEvent.code, playerEntity)) {
				world.attach(playerEntity, component(Code, { code: moduleEvent.code }))
			}
		} catch (e) {
			console.log(e)
		}
	}

	if (update) {
		//Maybe use number of connected players instead of MAX_PLAYERS
		const shipStates = Array<Map<Entity, ShipObservation>>(MAX_PLAYERS)
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
			const allies = Array<ShipObservation>()
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
			const observation = createObservation(body, allies, enemies)
			try {
				const main = await module.namespace.get('default')
				const nextAction = await main(observation)
				if (nextAction) {
					action.throttle = nextAction.throttle ? nextAction.throttle : 0
					action.yaw = nextAction.yaw ? nextAction.yaw : 0
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

function validateModule(
	isolate: ivm.Isolate,
	code: string,
	playerEntity: Entity
): boolean {
	try {
		const module = isolate.compileModuleSync(code)
		const testContext = isolate.createContextSync()
		module.instantiateSync(testContext, (specifier, referrer) => module)
		module.evaluateSync()
		const main = module.namespace.getSync('default')
		if (main instanceof Function) {
			console.log(`Module arrived for player entity ${playerEntity}`)
			return true
		}
		throw new Error('Module did not export a default function')
	} catch (err) {
		logTopic.push({
			type: LogType.Error,
			toEntity: playerEntity,
			message: `Error: ${err}`
		})
		return false
	}
}