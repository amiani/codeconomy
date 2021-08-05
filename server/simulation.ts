const rapier = require("@a-type/rapier2d-node")
import { ComponentOf, createEffect, createQuery, useMonitor } from "@javelin/ecs"
import { Body, Bullet, Transform } from "./components"

const bodies = createQuery(Body)
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

export default createEffect(world => {
	const sim = new rapier.World({ x: 0, y: 0 })

	return () => {
		useMonitor(
			bodies,
			() => {},
			(e, [body]) => sim.removeRigidBody(body)
		)
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
		sim.step()
		return sim
	}
}, { shared: true })