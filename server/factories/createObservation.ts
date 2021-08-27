const rapier = require('@a-type/rapier2d-node')

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
}

export interface ShipObservation {
	position: Vector
	rotation: number
	health: number
	team: number
}

interface Command {
	throttle: number,
	rotate: number,
	fire: boolean,
}

export default function createObservation(
	body: typeof rapier.RigidBody,
	allies: Array<ShipObservation>,
	enemies: Array<ShipObservation>,
): Observation {
	return {
		state: {
			position: body.translation(),
			velocity: body.linvel(),
			rotation: body.rotation(),
			angularVelocity: body.angvel(),
		},
		allies,
		enemies,
	}
}