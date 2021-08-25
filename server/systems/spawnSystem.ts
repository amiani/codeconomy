import { createQuery, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import ivm from 'isolated-vm'

import { Isolate, Module, Spawner, Allegiance, Transform, Player } from '../components'
import { GamePhase } from '../effects/usePhase'
import { createShip } from '../factories'
import { phaseTopic } from '../topics'

const spawnersTransformTeam = createQuery(Spawner, Transform, Allegiance)
const spawners = createQuery(Spawner)

export default function spawnSystem(world: World<Clock>): void {
	const { dt } = world.latestTickData
	for (const phaseEvent of phaseTopic) {
		if (phaseEvent.phase === GamePhase.run) {
			spawners((e, [spawner]) =>
				spawner.countdown.current = spawner.countdown.max)
		}
	}

	spawnersTransformTeam((e, [spawner, transform, allegiance]) => {
		spawner.countdown.current -= dt / 1000
		if (spawner.countdown.current <= 0) {
			try {
				const module = world.get(allegiance.player, Module) as ivm.Module
				const isolate = world.get(allegiance.player, Isolate) as ivm.Isolate
				const player = world.tryGet(allegiance.player, Player)
				const withLog = !!player
				const rot = Math.random() * Math.PI * 2
				createShip(
					world,
					transform.x,
					transform.y,
					rot,
					allegiance.player,
					allegiance.team,
					module,
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