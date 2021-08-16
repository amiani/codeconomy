import { createQuery, Entity, useMonitor, World } from "@javelin/ecs";
import { collisionTopic, shipTopic } from "../topics"
import { Allegiance, Body, Bullet, CombatHistory, Health } from "../components"
import { useColliderToEntity, useSimulation } from '../effects'
const rapier = require('@a-type/rapier2d-node')

const healths = createQuery(Health)
const bodies = createQuery(Body)

const checkBulletAndDamage = (world: World, entity1: Entity, entity2: Entity) => {
	try {
		const bullet = world.get(entity1, Bullet)
		const bulletAllegiance = world.get(entity1, Allegiance)
		const health = world.get(entity2, Health)
		const combatHistory2 = world.get(entity2, CombatHistory)
		health.current -= bullet.damage
		combatHistory2.lastHitByPlayer = bulletAllegiance.player
		world.destroy(entity1)
	} catch (e) {
		console.log(e)
	}
}

export default function damageSystem(world: World) {
	for (const collision of collisionTopic) {
		checkBulletAndDamage(world, collision.entity1, collision.entity2)
		checkBulletAndDamage(world, collision.entity2, collision.entity1)
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
	const sim = useSimulation()
	const entities = useColliderToEntity()
	useMonitor(
		bodies,
		() => {},
		(e, [body]: [typeof rapier.Body]) => {
			//console.log(`${e}: ${body.handle} Removing collider mapping`)
			const handle = body.collider(0)
			entities.delete(handle)
		}
	)
	useMonitor(
		bodies,
		(e, [body]) => {
			//console.log(`${e}: ${body.handle} has been added`)
		},
		(e, [body]) => {
			//console.log(`Removing body for ${e}: ${body.handle}`)
			sim.removeRigidBody(body)
		}
	)
}