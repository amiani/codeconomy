import { useInterval, World } from '@javelin/ecs'
import { useClient, useNet } from '../effects'
import { uploadTopic } from '../topics'
import { actions } from '../ui/state'

export default function clientSystem(world: World) {
	const net = useNet()
	const { client } = useClient()

	for (const uploadEvent of uploadTopic) {
		client.socket.send(uploadEvent.code)
	}

	const update = useInterval(1000)
	if (update) {
		actions.setRate(net.bytes / 1000)
		net.bytes = 0
	}
}