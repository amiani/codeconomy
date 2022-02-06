import { ComponentOf, createEffect, createQuery, Entity, useMonitor } from '@javelin/ecs'
import { ColliderHandle } from 'rapier2d-node'

import { Body } from '../components'

const bodies = createQuery(Body)

export default createEffect(world => {
	const entities = new Map<ColliderHandle, Entity>()

	return () => {
		return entities
	}
}, { shared: true })