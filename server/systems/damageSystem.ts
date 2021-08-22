import { createQuery, Entity, useMonitor, World } from "@javelin/ecs";
import { collisionTopic, shipTopic } from "../topics"
import { Allegiance, Body, Bullet, CombatHistory, Health } from "../components"
const rapier = require('@a-type/rapier2d-node')

const healths = createQuery(Health)

const handleBulletCollision = (world: World, bulletEntity: Entity, hitEntity: Entity) => {
	try {
		const bullet = world.get(bulletEntity, Bullet)
		const bulletAllegiance = world.get(bulletEntity, Allegiance)
		const hitHealth = world.get(hitEntity, Health)
		const hitCombatHistory = world.get(hitEntity, CombatHistory)
		hitHealth.current -= bullet.damage
		hitCombatHistory.lastHitByPlayer = bulletAllegiance.player
		world.destroy(bulletEntity)
	} catch (e) {
		//console.log(e)
	}
}

export default function damageSystem(world: World) {
	for (const event of collisionTopic) {
		switch (event.type) {
			case 'bullet':
				handleBulletCollision(world, event.entity1, event.entity2)
				break
		}
	}

	healths((e, [health]) => {
		if (health.current <= 0) {
			const combatHistory = world.get(e, CombatHistory)
			shipTopic.push({
				entity: e,
				type: 'ship-destroyed',
				combatHistory: { ...combatHistory }
			})
			world.destroy(e)
		}
	})
}