import { ComponentOf, createEffect, createQuery, Entity, useMonitor } from '@javelin/ecs'
const rapier = require('@a-type/rapier2d-node')

import { Body } from './components'

const bodies = createQuery(Body)

export default createEffect(world => {
	const entities = new Map<typeof rapier.CollisionHandle, Entity>()

	useMonitor(
		bodies,
		() => {},
		(e, [body]: [typeof rapier.Body]) => {
			const handle = body.collider(0)
			entities.delete(handle)
		}
	)

	return () => entities
}, { shared: true })