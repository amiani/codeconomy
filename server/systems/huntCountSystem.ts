import { component, createQuery, useInit, useMonitor, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { shipTopic } from "../topics";

import {
	Countdown,
	Player,
	HuntScore,
} from '../components'

const players = createQuery(Player)

const roundLength = 180

export default function huntCountSystem(world: World<Clock>) {
	let roundTimer
	if (useInit()) {
		roundTimer = component(Countdown, { current: roundLength, max: roundLength })
		world.create(roundTimer)
	}
	if (roundTimer) {
		const dt = world.latestTickData.dt
		roundTimer.current -= dt
		if (roundTimer.current <= 0) {
			world.reset()
		}
	}

	useMonitor(players,(e, [p]) => world.attach(e, component(HuntScore)))

	for (const shipEvent of shipTopic) {
		if (shipEvent.type === 'ship-destroyed') {
			try {
				const score = world.get(shipEvent.combatHistory.lastHitByPlayer, HuntScore)
				score && score.points++
				console.log(`Player score: ${score.points}`)
			} catch (err) {
				console.log(err)
			}
		}
	}
}