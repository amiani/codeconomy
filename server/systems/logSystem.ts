import { World } from "@javelin/ecs";
import { Header, MessageType } from "../../common/types";
import { ClientSchema } from "../components";
import { useClients } from "../effects";
import { logTopic } from "../topics";

const encoder = new TextEncoder()

export default function logSystem(world: World) {
	const { sendReliably } = useClients()
	for (const event of logTopic) {
		try {
			const client = world.get(event.toEntity, ClientSchema)
			const header: Header = {
				tick: world.latestTick,
				type: MessageType.Info,
			}
			const data = encoder.encode(event.message)
			sendReliably(client, header, data.buffer)
		} catch (err) {
			console.error(err)
		}
	}
}