const rapier = require("@a-type/rapier2d-node")
import { ComponentOf, createEffect, createQuery } from "@javelin/ecs"
import { Body, Transform } from "./components"

const transformsBody = createQuery(Transform, Body)

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
		transformsBody((e, [transform, body]) => {
			copyBodyToTransform(body, transform)
		})
		sim.step()
		return sim
	}
}, { shared: true })