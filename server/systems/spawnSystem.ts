import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import ivm from 'isolated-vm'

import { Isolate, Script, Spawner, Allegiance, Transform } from '../components'
import { createShip } from '../factories'

const spawnersTransformTeam = createQuery(Spawner, Transform, Allegiance)

export default function spawnSystem(world: World<Clock>): void {
	const { dt } = world.latestTickData
	spawnersTransformTeam((e, [spawner, transform, allegiance]) => {
		spawner.countdown.current -= dt / 1000
		if (spawner.countdown.current <= 0) {
			try {
				const script = world.get(allegiance.player, Script) as ivm.Script
				const isolate = world.get(allegiance.player, Isolate) as ivm.Isolate
				const rot = Math.random() * Math.PI * 2
				createShip(world, transform.x, transform.y, rot, allegiance.player, allegiance.team, script, isolate)
				spawner.countdown.current = spawner.countdown.max
			} catch (err) {
				//console.log(err)
			}
		}
	})
}