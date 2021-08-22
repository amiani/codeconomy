import { createTopic, Entity } from '@javelin/ecs'

type CollisionEvent = {
	type: string,
	entity1: Entity,
	entity2: Entity,
}

export default createTopic<CollisionEvent>()