import { World } from "@javelin/ecs";
import { Header, MessageType } from "../../common/types";
import { Player } from "../components";
import { useClients } from "../effects";
import { logTopic } from "../topics";

const encoder = new TextEncoder()

export default function logSystem(world: World) {
	const { sendReliable } = useClients()
	for (const event of logTopic) {
		try {
			const player = world.get(event.toEntity, Player)
			const header: Header = {
				tick: world.latestTick,
				type: MessageType.Info,
			}
			const data = encoder.encode(event.message)
			sendReliable(player.uid, header, data.buffer)
		} catch (err) {
			console.error(err)
		}
	}
}