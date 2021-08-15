import { World } from '@javelin/ecs'
import { useClient, useNet } from '../effects'
import { uploadTopic } from '../topics'

export default function clientSystem(world: World) {
	const net = useNet()
	const { client } = useClient()
	for (const uploadEvent of uploadTopic) {
		client.socket.send(uploadEvent.code)
	}
}