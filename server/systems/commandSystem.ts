import {
	World,
	createQuery,
} from '@javelin/ecs'
import { RigidBody } from 'rapier2d-node'

import { useSimulation } from '../effects'
import {
	Body,
	Allegiance,
	Weapon,
	Command,
} from '../components'
import { createLaser } from '../factories'

const ships = createQuery(Body, Command, Allegiance, Weapon)

export default function commandSystem(world: World) {
	const sim = useSimulation()
	ships((e, [bodyComp, command, allegiance, weapon]) => {
		const body = bodyComp as RigidBody
		const shipRotation = body.rotation()
		const clampedThrottle = Math.max(Math.min(command.throttle, 100), 0)
		body.applyForce({
			x: Math.cos(shipRotation) * clampedThrottle,
			y: Math.sin(shipRotation) * clampedThrottle
		}, true)
		body.applyTorque(command.yaw, true)

		if (command.fire && weapon.currentCooldown <= 0) {
			const shipPosition = body.translation()
			const laserPosition = {
				x: shipPosition.x + Math.cos(shipRotation) * 1.6,
				y: shipPosition.y + Math.sin(shipRotation) * 1.6
			}
			createLaser(world, laserPosition, shipRotation, allegiance.player, allegiance.team)
			weapon.currentCooldown = weapon.maxCooldown
		}
		weapon.currentCooldown -= sim.timestep
		command = { throttle: 0, yaw: 0, fire: false }
	})

}