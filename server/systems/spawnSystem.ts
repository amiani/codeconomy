import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import ivm from 'isolated-vm'
import { Phase } from '../../common/types'

import { Isolate, Module, Spawner, Allegiance, Transform, Player, Code } from '../components'
import { createShip } from '../factories'
import { phaseTopic } from '../topics'

const spawnersTransformTeam = createQuery(Spawner, Transform, Allegiance)
const spawners = createQuery(Spawner)

export default function spawnSystem(world: World<Clock>): void {
	const { dt } = world.latestTickData
	for (const phaseEvent of phaseTopic) {
		if (phaseEvent.phase === Phase.run) {
			spawners((e, [spawner]) =>
				spawner.countdown.current = spawner.countdown.max)
		}
	}

	spawnersTransformTeam((e, [spawner, transform, allegiance]) => {
		spawner.countdown.current -= dt / 1000
		if (spawner.countdown.current <= 0) {
			try {
				const code = world.get(allegiance.player, Code).code
				const isolate = world.get(allegiance.player, Isolate) as ivm.Isolate
				const player = world.tryGet(allegiance.player, Player)
				const withLog = !!player
				const rot = Math.random() * Math.PI * 2
				createShip(
					world,
					transform.x,
					transform.y,
					rot,
					0,
					allegiance.player,
					allegiance.team,
					code,
					isolate, 
					withLog
				)
				spawner.countdown.current = spawner.countdown.max
			} catch (err) {
				//console.log(err)
			}
		}
	})
}