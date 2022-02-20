import { World, createQuery, Entity, useInterval, component } from "@javelin/ecs"
import ivm from "isolated-vm"
import { RigidBody } from 'rapier2d-node'

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
import { Observation, Command as ShipCommand, ShipObservation } from "../factories/createObservation"
import { logTopic, scriptTopic } from "../topics"
import { LogType } from "../topics/logTopic"

const moduleShipQuery = createQuery(Module, Body, Command, Allegiance, Health)
const shipQuery = createQuery(CombatHistory, Transform, Allegiance, Health)

export default function scriptSystem(world: World) {
	const update = useInterval(1000 / 10)
	const clients = useClients()

	for (const { uid, code } of scriptTopic) {
		const playerEntity = clients.getPlayer(uid)
		if (!playerEntity) {
			break
		}
		try {
			const isolate = world.get(playerEntity, Isolate) as ivm.Isolate
			if (validateModule(isolate, code, playerEntity)) {
				world.attach(playerEntity, component(Code, { code }))
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
		moduleShipQuery(async (e, [moduleComp, bodyComp, command, allegiance, health]) => {
			const body = bodyComp as RigidBody
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
			const observation = createObservation(body, health, allies, enemies)
			try {
				const main = await module.namespace.get('default') as Policy
				const nextCommand = await main(observation)
				if (nextCommand) {
					command.throttle = nextCommand.throttle ?? 0
					command.yaw = nextCommand.yaw ? nextCommand.yaw : 0
					command.fire = nextCommand.fire ? nextCommand.fire : false
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

type Policy = (o: Observation) => Promise<ShipCommand>

const isPolicy = (value: unknown): value is Policy => {
	return value instanceof Function
}

function validateModule(
	isolate: ivm.Isolate,
	code: string,
	playerEntity: Entity
): boolean {
	try {
		const module = isolate.compileModuleSync(code)
		const testContext = isolate.createContextSync()
		module.instantiateSync(testContext, () => module)
		module.evaluateSync()
		const defaultExport: unknown = module.namespace.getSync('default')
		if (isPolicy(defaultExport)) {
			console.log(`Module arrived for player entity ${playerEntity}`)
			return true
		}
		console.log(`Invalid module arrived for player entity ${playerEntity}`)
		return false
	} catch (err: unknown) {
		logTopic.push({
			type: LogType.Error,
			toEntity: playerEntity,
			message: `Server received invalid script: ${err}`
		})
		return false
	}
}