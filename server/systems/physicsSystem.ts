import {
	World,
	createQuery,
	toComponent,
	component,
	useMonitor,
} from '@javelin/ecs'
import { useColliderToEntity } from '../effects'
const rapier = require('@a-type/rapier2d-node')

import { useSimulation } from '../effects'
import {
	Body,
	Team,
	Weapon,
	Action,
} from '../components'
import { createLaser } from '../factories'

const bodiesActionTeamWeapon = createQuery(Body, Action, Team, Weapon)

const bodies = createQuery(Body)
export default function physicsSystem(world: World) {
	const sim = useSimulation()
	const colliderToEntity = useColliderToEntity()
	bodiesActionTeamWeapon((e, [bodyComp, action, team, weapon]) => {
		const body = bodyComp as typeof rapier.Body
		const shipRotation = body.rotation()
		const clampedThrottle = Math.max(Math.min(action.throttle, 100), 0)
		body.applyForce({
			x: Math.cos(shipRotation) * clampedThrottle,
			y: Math.sin(shipRotation) * clampedThrottle
		}, true)
		body.applyTorque(action.rotate, true)

		if (action.fire && weapon.currentCooldown <= 0) {
			const shipPosition = body.translation()
			const laserPosition = {
				x: shipPosition.x + Math.cos(shipRotation) * 1.6,
				y: shipPosition.y + Math.sin(shipRotation) * 1.6
			}
			createLaser(world, laserPosition, shipRotation, team.id)
			weapon.currentCooldown = weapon.maxCooldown
		}
		weapon.currentCooldown -= sim.timestep
		action = { throttle: 0, rotate: 0, fire: false }
	})
}