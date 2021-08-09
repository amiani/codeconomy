import {
	World,
	createQuery,
	toComponent,
	component,
	useMonitor,
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
import createLaser from '../createLaser'

const bodiesActionTeamWeapon = createQuery(Body, Action, Team, Weapon)

const bodies = createQuery(Body)
export default function physicsSystem(world: World) {
	const sim = useSimulation()
	const colliderToEntity = useColliderToEntity()
	bodiesActionTeamWeapon((e, [bodyComp, action, team, weapon]) => {
		const body = bodyComp as typeof rapier.Body
		const rot = body.rotation()
		body.applyForce({
			x: Math.cos(rot) * action.throttle,
			y: Math.sin(rot) * action.throttle
		}, true)
		body.applyTorque(action.rotate, true)
		if (action.fire && weapon.currentCooldown <= 0) {
			createLaser(world, body.translation(), body.rotation(), team.id)
			weapon.currentCooldown = weapon.maxCooldown
		}
		weapon.currentCooldown -= sim.timestep
		action = { throttle: 0, rotate: 0, fire: false }
	})
}