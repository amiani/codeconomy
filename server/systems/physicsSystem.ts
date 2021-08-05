import {
	World,
	createQuery,
	toComponent,
	component,
} from '@javelin/ecs'
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
		.setCollisionGroups(0x00020002)

	const sim = useSimulation()
	const body = sim.createRigidBody(bodyDesc)
	sim.createCollider(colliderDesc, body.handle)

	return [
		toComponent(body, Body),
		component(Transform, position),
		component(Team, { id: team }),
		component(Bullet, { velocity, lifetime: 2 }),
		component(SpriteData, { name: 'smallbluelaser' })
	]
}

export default function physicsSystem(world: World) {
	const sim = useSimulation()
	bodiesActionTeamWeapon((e, [bodyComp, action, team, weapon]) => {
		const body = bodyComp as typeof rapier.Body
		body.applyForce({ x: action.throttle, y: 0 }, true)
		body.applyTorque(action.rotate, true)
		if (action.fire && weapon.currentCooldown <= 0) {
			world.create(...createLaser(body.translation(), body.rotation(), team.id))
			weapon.currentCooldown = weapon.maxCooldown
		}
		weapon.currentCooldown -= sim.timestep
		action = { throttle: 0, rotate: 0, fire: false }
	})
}