import { createQuery, useInterval, useMonitor, World } from '@javelin/ecs'
import { Countdown, GameData } from '../../../server/components'
import { useClient, useNet } from '../effects'
import { uploadTopic } from '../topics'
import { actions, states } from '../ui/state'

const gameDatas = createQuery(GameData)
const countdowns = createQuery(Countdown)

export default function clientSystem(world: World) {
	const net = useNet()
	const { client } = useClient()

	for (const uploadEvent of uploadTopic) {
		client.socket.send(uploadEvent.code)
	}

	gameDatas((e, [data]) => {
		if (net.updated.has(e)) {
			const latestTick = states().debug.tick
			if (data.tick <= latestTick) {
				console.log(`got tick ${data.tick} after ${latestTick}`)
			}
			actions.setTick(data.tick)
		}
	})

	const update = useInterval(1000)
	if (update) {
		actions.setRate(net.bytes / 1000)
		net.bytes = 0
	}
}