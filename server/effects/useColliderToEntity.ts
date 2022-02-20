import { createEffect, Entity } from '@javelin/ecs'
import { ColliderHandle } from 'rapier2d-node'

export default createEffect(() => {
	const entities = new Map<ColliderHandle, Entity>()

	return () => {
		return entities
	}
}, { shared: true })