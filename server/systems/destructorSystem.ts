import { World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { shipTopic } from "../topics";

export default function descructorSystem(world: World<Clock>) {
	for (const shipEvent of shipTopic) {
		if (shipEvent.type === 'ship-destroyed') {
			world.destroy(shipEvent.entity)
		}
	}
}