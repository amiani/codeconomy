import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import ivm from 'isolated-vm'

import { Isolate, Script, Spawner, Team, Transform } from '../components'
import createShip from '../createShip'

const spawnersTransformTeam = createQuery(Spawner, Transform, Team)

export default function spawnSystem(world: World<Clock>): void {
	const { dt } = world.latestTickData
	spawnersTransformTeam((e, [spawner, transform, team]) => {
		spawner.timer.current -= dt / 1000
		if (spawner.timer.current <= 0) {
			if (world.has(spawner.owner, Script)) {
				const script = world.get(spawner.owner, Script) as ivm.Script
				const isolate = world.get(spawner.owner, Isolate) as ivm.Isolate
				const rot = Math.random() * Math.PI * 2
				createShip(world, transform.x, transform.y, rot, team.id, script, isolate)
				spawner.timer.current = spawner.timer.max
			}
		}
	})
}