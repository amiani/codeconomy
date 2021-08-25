import { component, Entity, toComponent, World } from "@javelin/ecs"
import ivm from 'isolated-vm'
const rapier = require("@a-type/rapier2d-node")

import { useColliderToEntity, useSimulation } from '../effects'
import { Action, Body, CombatHistory, Context, Health, Module, SpriteData, Allegiance, Transform, Weapon, Log } from "../components"
import createContext from "../createContext"

export default function createShip(
	world: World,
	x: number,
	y: number,
	rotation: number,
	player: Entity,
	team: number,
	module: ivm.Module,
	isolate: ivm.Isolate,
	withLog: boolean,
) {
	//console.log(`Creating ship at ${x}, ${y}`)
	const e = world.create()
	const bodyDesc = rapier.RigidBodyDesc.newDynamic()
		.setTranslation(x, y)
		.setRotation(rotation)
		.setLinearDamping(0.9)
		.setAngularDamping(0.7)
	const colliderDesc = rapier.ColliderDesc.cuboid(1, 1)
			.setCollisionGroups(0x00010000 + 0x0003)
		.setActiveEvents(
		rapier.ActiveEvents.CONTACT_EVENTS
		| rapier.ActiveEvents.INTERSECTION_EVENTS)
	
	const sim = useSimulation()
	const body = sim.createRigidBody(bodyDesc)
	const collider = sim.createCollider(colliderDesc, body.handle)
	const colliderToEntity = useColliderToEntity()
	colliderToEntity.set(collider.handle, e)
	
	let context
	if (withLog) {
		const log = component(Log)
		world.attach(e, log)
		context = createContext(isolate, log)
	} else {
		context = createContext(isolate)
	}
	const res = module.instantiate(context, (specifier, referrer) => {
		//TODO: return actual dependencies
		return module
	})
	module.evaluateSync()

	world.attach(e,
		component(CombatHistory, { lastHitByPlayer: -1 }),
		component(Transform, { x, y, rotation }),
		toComponent(body, Body),
		toComponent(module, Module),
		toComponent(context, Context),
		component(Weapon, { damage: 1, maxCooldown: 0.1, currentCooldown: 0 }),
		component(Allegiance, { player, team }),
		component(SpriteData, { name: "condor" }),
		component(Action),
		component(Health, { current: 10, max: 10 }),
	)
}