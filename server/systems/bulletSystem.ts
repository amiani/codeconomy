import { createQuery, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { Ray } from 'rapier2d-node';

import { Bullet, Transform } from "../components"
import { useColliderToEntity, useSimulation } from "../effects";
import { collisionTopic } from "../topics";

const bullets = createQuery(Bullet, Transform)

export default function bulletSystem(world: World<Clock>) {
	const sim = useSimulation()
	const colliders = useColliderToEntity()
	bullets((e, [bullet, transform]) => {
		const ray = new Ray(
			{ x: transform.x, y: transform.y },
			{ x: bullet.velocity.x, y: bullet.velocity.y }
		)
		const hit = sim.castRay(ray, sim.timestep, true, 0x00020000 + 0x0001)
		if (hit) {
			const hitEntity = colliders.get(hit.colliderHandle)
			if (hitEntity) {
				collisionTopic.push({ type: "bullet", entity1: e, entity2: hitEntity })
			}
		} else {
			transform.x += bullet.velocity.x * sim.timestep
			transform.y += bullet.velocity.y * sim.timestep
			bullet.lifetime -= sim.timestep
			if (bullet.lifetime <= 0) {
				world.destroy(e)
			}
		}
	})
}