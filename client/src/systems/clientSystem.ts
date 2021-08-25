import { createQuery, useInterval, useMonitor, World } from '@javelin/ecs'
import { Countdown, Player } from '../../../server/components'
import { useClient, useNet } from '../effects'
import { uploadTopic } from '../topics'
import { actions, states } from '../ui/state'

const playerQuery = createQuery(Player)
const countdownQuery = createQuery(Countdown)

export default function clientSystem(world: World) {
	const net = useNet()
	const { client, uid, setPlayerEntity } = useClient()

	for (const uploadEvent of uploadTopic) {
		client.socket.send(uploadEvent.code)
	}

	const update = useInterval(1000)
	if (update) {
		actions.setRate(net.bytes / 1000)
		net.bytes = 0
	}

	useMonitor(
		playerQuery,
		(e, [player]) => {
			if (player.uid === uid) {
				setPlayerEntity(e)
			}
		}
	)
}