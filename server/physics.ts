const rapier = require("@a-type/rapier2d-node")
import { createEffect } from "@javelin/ecs"


export default createEffect(world => {
	const physics = new rapier.World({ x: 0, y: 0 })
	return () => physics
}, { shared: true })