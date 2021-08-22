import { component, Entity, toComponent, World } from "@javelin/ecs"
import { useColliderToEntity, useSimulation } from '../effects'
import ivm from 'isolated-vm'
import { Action, Body, CombatHistory, Context, Health, Script, SpriteData, Allegiance, Transform, Weapon, Log } from "../components"
import createContext from "../createContext"

const rapier = require("@a-type/rapier2d-node")

export default function createShip(
	world: World,
	x: number,
	y: number,
	rotation: number,
	player: Entity,
	team: number,
	script: ivm.Script,
	isolate: ivm.Isolate,
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
	
	const log = component(Log)
	const context = createContext(isolate, log)
	const res = (<ivm.Script>script).run(context, { copy: true })
		//.then(value => console.log(`SCRIPT RUN`))
		.catch(err => console.error(err))

	world.attach(e,
		component(CombatHistory, { lastHitByPlayer: -1 }),
		component(Transform, { x, y, rotation }),
		toComponent(body, Body),
		toComponent(script, Script),
		toComponent(context, Context),
		component(Weapon, { damage: 1, maxCooldown: 0.1, currentCooldown: 0 }),
		component(Allegiance, { player, team }),
		component(SpriteData, { name: "condor" }),
		component(Action),
		component(Health, { current: 10, max: 10 }),
		log,
	)
}