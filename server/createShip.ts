import { component, Entity, toComponent, World } from "@javelin/ecs"
import useSimulation from './simulation'
import useColliderToEntity from './colliderToEntity'
import ivm from 'isolated-vm'
import { Action, Body, Context, Health, Script, Ship, SpriteData, Team, Transform, Weapon } from "./components"

const rapier = require("@a-type/rapier2d-node")

export default function createShip(
	world: World,
	x: number,
	y: number,
	rotation: number,
	team: number,
	script: ivm.Script,
	isolate: ivm.Isolate,
) {
	console.log(`Creating ship at ${x}, ${y}`)
	const e = world.create()
	const bodyDesc = rapier.RigidBodyDesc.newDynamic()
		.setTranslation(x, y)
		.setRotation(rotation)
		.setLinearDamping(0.9)
		.setAngularDamping(0.9)
	const colliderDesc = rapier.ColliderDesc.cuboid(1, 1)
			.setCollisionGroups(0x00010000 * (team+1) + 0x0004 * (2-team))
		.setActiveEvents(
		rapier.ActiveEvents.CONTACT_EVENTS
		| rapier.ActiveEvents.INTERSECTION_EVENTS)
	
	const sim = useSimulation()
	const body = sim.createRigidBody(bodyDesc)
	const collider = sim.createCollider(colliderDesc, body.handle)
	const colliderToEntity = useColliderToEntity()
	colliderToEntity.set(collider.handle, e)
	
	const context = isolate.createContextSync()
	world.attach(e,
		component(Ship),
		component(Transform, { x, y, rotation }),
		toComponent(body, Body),
		toComponent(script, Script),
		toComponent(context, Context),
		component(Weapon, { damage: 1, maxCooldown: 0.1, currentCooldown: 0 }),
		component(Team, { id: team }),
		component(SpriteData, { name: "ship" }),
		component(Action),
		component(Health, { current: 100, max: 100 })
	)
}