const rapier = require("@a-type/rapier2d-node")
import { ComponentOf, createEffect, createQuery, useMonitor, World } from "@javelin/ecs"
import { Body, Bullet, Transform } from "../components"
import useColliderToEntity from "./useColliderToEntity"
import { collisionTopic } from "../topics"

const transformsBody = createQuery(Transform, Body)
const bulletsBody = createQuery(Bullet, Body)

const copyBodyToTransform = (
	body: typeof rapier.Body,
	transform: ComponentOf<typeof Transform>
) => {
	const translation = body.translation()
	transform.x = translation.x
	transform.y = translation.y
	transform.rotation = body.rotation()
}

export default createEffect((world: World) => {
	const sim = new rapier.World({ x: 0, y: 0 })
	const eventQueue = new rapier.EventQueue(true)

	return () => {
		//console.log('useSimulation')

		bulletsBody((e, [bullet, bodyComp]) => {
			if (bullet.lifetime >= 0) {
				const body = bodyComp as typeof rapier.Body
				body.setLinvel(bullet.velocity, true)
			} else {
				world.destroy(e)
			}
			bullet.lifetime -= sim.timestep
		})
		transformsBody((e, [transform, body]) => {
			copyBodyToTransform(body, transform)
		})


		sim.step(eventQueue)
		const colliderToEntity = useColliderToEntity()
		eventQueue.drainIntersectionEvents((
			handle1: typeof rapier.CollisionHandle,
			handle2: typeof rapier.CollisionHandle,
			started: boolean,
		) => {
			if (started) {
				const entity1 = colliderToEntity.get(handle1)
				const entity2 = colliderToEntity.get(handle2)
				if (entity1 !== undefined && entity2 !== undefined) {
					collisionTopic.push({ type: "collision", entity1, entity2 })
				}
			}
		})

		return sim
	}
}, { shared: true })