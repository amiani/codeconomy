import { ComponentOf } from "@javelin/ecs"
import { Health } from "../components"

import { RigidBody } from 'rapier2d-node'

interface Vector {
	x: number
	y: number
}

interface Observation {
	state: SelfState
	allies: ShipObservation[]
	enemies: ShipObservation[]
}

interface SelfState {
	position: Vector
	velocity: Vector
	rotation: number
	angularVelocity: number
	health: number
	maxHealth: number
}

export interface ShipObservation {
	position: Vector
	rotation: number
	health: number
	team: number
}

interface Command {
	throttle: number,
	yaw: number,
	fire: boolean,
}

export default function createObservation(
	body: RigidBody,
	health: ComponentOf<typeof Health>,
	allies: Array<ShipObservation>,
	enemies: Array<ShipObservation>,
): Observation {
	return {
		state: {
			position: body.translation(),
			velocity: body.linvel(),
			rotation: body.rotation(),
			angularVelocity: body.angvel(),
			health: health.current,
			maxHealth: health.max,
		},
		allies,
		enemies,
	}
}