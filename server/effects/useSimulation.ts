import Rapier, { RigidBody, ColliderHandle } from 'rapier2d-node';
import { ComponentOf, createEffect, createQuery, useMonitor } from "@javelin/ecs"
import { Body, Transform } from "../components"
import useColliderToEntity from "./useColliderToEntity"
import { collisionTopic } from "../topics"

const transformsBody = createQuery(Transform, Body)

function copyBodyToTransform(
	body: ComponentOf<typeof Body>,
	transform: ComponentOf<typeof Transform>
) {
	const translation = (body as RigidBody).translation()
	transform.x = translation.x
	transform.y = translation.y
	transform.rotation = (body as RigidBody).rotation()
}

const bodies = createQuery(Body)

export default createEffect(() => {
	const sim = new Rapier.World({ x: 0, y: 0 })
	const eventQueue = new Rapier.EventQueue(true)

	return () => {
		sim.step(eventQueue)

		transformsBody((e, [transform, body]) =>
			copyBodyToTransform(body, transform)
		)

		const colliders = useColliderToEntity()
		eventQueue.drainIntersectionEvents((
			handle1: ColliderHandle,
			handle2: ColliderHandle,
			started: boolean,
		) => {
			if (started) {
				const entity1 = colliders.get(handle1)
				const entity2 = colliders.get(handle2)
				if (entity1 !== undefined && entity2 !== undefined) {
					collisionTopic.push({ type: "collision", entity1, entity2 })
				}
			}
		})

		useMonitor(
			bodies,
			() => void 0,
			(e, [body]) => {
				//console.log(`${e}: ${body.handle} Removing collider mapping`)
				const handle = (body as RigidBody).collider(0)
				colliders.delete(handle)
				sim.removeRigidBody(body as RigidBody)
			}
		)

		return sim
	}
}, { shared: true })