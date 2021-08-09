import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import ivm from 'isolated-vm'

import { Isolate, Script, Spawner, Team, Transform } from '../components'
import createShip from '../createShip'

const spawnersTransformTeam = createQuery(Spawner, Transform, Team)

export default function spawnSystem(world: World): void {
	const clock = world.latestTickData as Clock
	spawnersTransformTeam((e, [spawner, transform, team]) => {
		spawner.timer.current -= clock.dt / 1000
		if (spawner.timer.current <= 0) {
			try {
				const script = world.get(spawner.owner, Script) as ivm.Script
				const isolate = world.get(spawner.owner, Isolate) as ivm.Isolate
				const rot = Math.random() * Math.PI * 2
				createShip(world, transform.x, transform.y, rot, team.id, script, isolate)
			} catch (e) {
				console.error(e)
			}
			spawner.timer.current = spawner.timer.max
		}
	})
}