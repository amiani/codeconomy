import { component, Entity, World } from "@javelin/ecs"
import { Allegiance, Bullet, SpriteData, Transform } from "../components"
const rapier = require('@a-type/rapier2d-node')

export default function createLaser(
	world: World,
	position: { x: number; y: number },
	rotation: number,
	player: Entity,
	team: number
) {
	const speed = 100
	const velocity = { x: Math.cos(rotation) * speed, y: Math.sin(rotation) * speed }
	return world.create(
		component(Transform, { ...position, rotation }),
		component(Allegiance, { player, team }),
		component(Bullet, { velocity, lifetime: 1, damage: 1 }),
		component(SpriteData, { name: 'smallbluelaser' })
	)
}