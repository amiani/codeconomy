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
	Action
} from '../components'

const bodiesActionTeam = createQuery(Body, Action, Team)

const createLaser = (
	position: { x: number; y: number },
	rotation: number,
	team: number
) => {
	const speed = 100
	const bodyDesc = rapier.RigidBodyDesc.newDynamic()
		.setTranslation(position.x, position.y)
		.setRotation(rotation)
		.setLinvel(speed * Math.cos(rotation), speed * Math.sin(rotation))

	const colliderDesc = rapier.ColliderDesc.cuboid(16, 2)

	const sim = useSimulation()
	const body = sim.createRigidBody(bodyDesc)
	sim.createCollider(colliderDesc, body.handle)

	return [
		toComponent(body, Body),
		component(Transform, position),
		component(Team, { id: team }),
		component(SpriteData, { name: 'smallbluelaser' })
	]
}

export default function physicsSystem(world: World) {
	bodiesActionTeam((e, [bodyComp, action, team]) => {
		const body = bodyComp as typeof rapier.Body
		body.applyForce({ x: action.throttle, y: 0 }, true)
		body.applyTorque(action.rotate, true)
		if (action.fire) {
			world.create(...createLaser(body.translation(), body.rotation(), team.id))
		}
		action = { throttle: 0, rotate: 0, fire: false }
	})
}