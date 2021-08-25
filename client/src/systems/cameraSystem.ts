import { createQuery, useMonitor, World } from "@javelin/ecs";
import { workerData } from "worker_threads";

import { Allegiance, Spawner, Transform } from "../../../server/components"
import { useClient, useViewport } from "../effects";

const spawnerQuery = createQuery(Spawner, Transform, Allegiance).select(Transform, Allegiance)

export default function cameraSystem(world: World) {
	const viewport = useViewport()
	const { playerEntity } = useClient()

	useMonitor(
		spawnerQuery,
		(e, [transform, allegiance]) => {
			console.log(`spawner team: ${allegiance.team}`)
			try {
				const team = world.get(playerEntity, Allegiance).team
				if (allegiance.team === team) {
					viewport.moveCenter(transform.x, -transform.y)
					viewport.emit("moved")
				}
			} catch (err) {
			}
		}
	)
}