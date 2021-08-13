import { ComponentOf, createEffect, createQuery, Entity, useMonitor } from '@javelin/ecs'
const rapier = require('@a-type/rapier2d-node')

import { Body } from '../components'

const bodies = createQuery(Body)

export default createEffect(world => {
	const entities = new Map<typeof rapier.CollisionHandle, Entity>()

	return () => {
		return entities
	}
}, { shared: true })