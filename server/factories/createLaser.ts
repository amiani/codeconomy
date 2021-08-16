import { component, Entity, toComponent, World } from "@javelin/ecs"
import { useColliderToEntity, useSimulation } from '../effects'
import { Body, Allegiance, Bullet, SpriteData, Transform } from "../components"
const rapier = require('@a-type/rapier2d-node')

export default function createLaser(
	world: World,
	position: { x: number; y: number },
	rotation: number,
	player: Entity,
	team: number
) {
	const e = world.create()
	const speed = 100
	const velocity = { x: Math.cos(rotation) * speed, y: Math.sin(rotation) * speed }
	const bodyDesc = rapier.RigidBodyDesc.newKinematicVelocityBased()
		.setTranslation(position.x, position.y)
		.setRotation(rotation)
		.setLinvel(velocity.x, velocity.y)
		.setCanSleep(false)

	const colliderDesc = rapier.ColliderDesc.cuboid(.5, 2/32)
		.setCollisionGroups(0x00020000 + 0x0001)
		.setIsSensor(true)
		.setActiveEvents(rapier.ActiveEvents.INTERSECTION_EVENTS)

	const sim = useSimulation()
	const body = sim.createRigidBody(bodyDesc)
	const collider = sim.createCollider(colliderDesc, body.handle)
	const colliderToEntity = useColliderToEntity()
	colliderToEntity.set(collider.handle, e)

	world.attach(e,
		toComponent(body, Body),
		component(Transform, position),
		component(Allegiance, { player, team }),
		component(Bullet, { velocity, lifetime: 1, damage: 1 }),
		component(SpriteData, { name: 'smallbluelaser' })
	)
}