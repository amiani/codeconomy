import { createTopic, Entity } from "@javelin/ecs";

interface PlayerEvent {
	type: string,
	entity: Entity,
}

export default createTopic<PlayerEvent>()