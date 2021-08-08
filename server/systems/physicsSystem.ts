import {
	World,
	createQuery,
	toComponent,
	component,
	Entity,
} from '@javelin/ecs'
import useColliderToEntity from '../colliderToEntity'
const rapier = require('@a-type/rapier2d-node')

import useSimulation from '../simulation'
import {
	Body,
	Transform,
	Team,
	SpriteData,
	Weapon,
	Action,
	Bullet
} from '../components'

const bodiesActionTeamWeapon = createQuery(Body, Action, Team, Weapon)

const createLaser = (
	world: World,
	e: Entity,
	position: { x: number; y: number },
	rotation: number,
	team: number
) => {
	const speed = 100
	const velocity = { x: Math.cos(rotation) * speed, y: Math.sin(rotation) * speed }
	const bodyDesc = rapier.RigidBodyDesc.newKinematicVelocityBased()
		.setTranslation(position.x, position.y)
		.setRotation(rotation)
		.setLinvel(velocity.x, velocity.y)

	const colliderDesc = rapier.ColliderDesc.cuboid(16, 2)
		.setCollisionGroups(0x00040000 * (team + 1) + 2 - team)
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
		component(Team, { id: team }),
		component(Bullet, { velocity, lifetime: 1, damage: 1 }),
		component(SpriteData, { name: 'smallbluelaser' })
	)
}

export default function physicsSystem(world: World) {
	const colliderToEntity = useColliderToEntity()
	const sim = useSimulation()
	bodiesActionTeamWeapon((e, [bodyComp, action, team, weapon]) => {
		const body = bodyComp as typeof rapier.Body
		body.applyForce({ x: action.throttle, y: 0 }, true)
		body.applyTorque(action.rotate, true)
		if (action.fire && weapon.currentCooldown <= 0) {
			const entity = world.create()
			createLaser(world, entity, body.translation(), body.rotation(), team.id)
			weapon.currentCooldown = weapon.maxCooldown
		}
		weapon.currentCooldown -= sim.timestep
		action = { throttle: 0, rotate: 0, fire: false }
	})
}