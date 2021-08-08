import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'

import { Spawner, Team, Transform } from '../components'
import createShip from '../createShip'

const spawnersTransformTeam = createQuery(Spawner, Transform, Team)

export default function spawnerSystem(world: World): void {
	const clock = world.latestTickData as Clock
	spawnersTransformTeam((e, [spawner, transform, team]) => {
		spawner.timer.current -= clock.dt / 1000
		if (spawner.timer.current <= 0) {
			createShip(world, transform.x, transform.y, team.id)
			spawner.timer.current = spawner.timer.max
		}
	})
}