import { createQuery, useMonitor, World } from "@javelin/ecs";
import * as PIXI from 'pixi.js'

import { Allegiance, Bullet, Spawner, Sprite, Transform } from "../../../server/components"
import { useClient, useViewport } from "../effects";

const spawnerQuery = createQuery(Spawner, Transform, Allegiance).select(Transform, Allegiance)
const shipQuery = createQuery(Sprite, Transform)
	.not(Spawner, Bullet)
	.select(Sprite)

export default function cameraSystem(world: World) {
	const { viewport, move } = useViewport()
	const { playerEntity } = useClient()

	useMonitor(
		spawnerQuery,
		(e, [transform, allegiance]) => {
			try {
				const team = world.get(playerEntity, Allegiance).team
				if (allegiance.team === team) {
					move(transform.x, -transform.y)
				}
			} catch (err) {
			}
		}
	)

	useMonitor(
		shipQuery,
		(e, [spriteComp]) => {
			const sprite = spriteComp as PIXI.Sprite
			sprite.interactive = true
			sprite.buttonMode = true
			sprite.on('click', (event) => viewport.follow(sprite))
		}
	)
}