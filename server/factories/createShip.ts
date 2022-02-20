import { component, Entity, toComponent, World } from "@javelin/ecs"
import ivm from 'isolated-vm'
import Rapier, { ActiveEvents, ColliderDesc, RigidBodyDesc } from 'rapier2d-node'

import { Command, Body, CombatHistory, Context, Health, Module, SpriteData, Allegiance, Transform, Weapon, Log } from "../components"
import createContext from "./createContext"

export default function createShip(
	world: World,
	sim: Rapier.World,
	x: number,
	y: number,
	rotation: number,
	launchSpeed: number,
	player: Entity,
	team: number,
	code: string,
	isolate: ivm.Isolate,
	withLog: boolean,
	colliderToEntity: Map<number, Entity>,
) {
	//console.log(`Creating ship at ${x}, ${y}`)
	const e = world.create()
	const vx = Math.cos(rotation) * launchSpeed
	const vy = Math.sin(rotation) * launchSpeed
	const bodyDesc = RigidBodyDesc.newDynamic()
		.setTranslation(x, y)
		.setRotation(rotation)
		.setLinearDamping(0.9)
		.setAngularDamping(0.7)
		.setLinvel(vx, vy)
	const colliderDesc = ColliderDesc.cuboid(1, 1)
			.setCollisionGroups(0x00010000 + 0x0003)
		.setActiveEvents(
		ActiveEvents.CONTACT_EVENTS
		| ActiveEvents.INTERSECTION_EVENTS)
	
	const body = sim.createRigidBody(bodyDesc)
	const collider = sim.createCollider(colliderDesc, body.handle)
	colliderToEntity.set(collider.handle, e)
	
	let context
	if (withLog) {
		const log = component(Log)
		world.attach(e, log)
		context = createContext(isolate, log)
	} else {
		context = createContext(isolate)
	}
	const module = isolate.compileModuleSync(code)
	/*
	const res = module.instantiateSync(context, () => {
		//TODO: return actual dependencies
		return module
	})
	*/
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
		component(Command),
		component(Health, { current: 10, max: 10 }),
	)
}