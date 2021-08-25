import { World } from "@javelin/ecs";
import { useClients } from "../effects";
import { logTopic } from "../topics";

export default function logSystem(world: World) {
	const { sendReliable } = useClients()
	for (const event of logTopic) {
	}
}