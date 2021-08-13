import { createQuery, Entity, useMonitor, World } from "@javelin/ecs";
import { collisionTopic } from "../topics"
import { Body, Bullet, Health } from "../components"
import { useColliderToEntity, useSimulation } from '../effects'
const rapier = require('@a-type/rapier2d-node')

const healths = createQuery(Health)
const bodies = createQuery(Body)

const applyDamage = (world: World, e: Entity, damage: number) => {
	const health = world.tryGet(e, Health)
	if (health) {
		console.log(`${damage} damage done to entity ${e}`)
		health.current -= damage
	}
}

const checkBulletAndDamage = (world: World, entity1: Entity, entity2: Entity) => {
	try {
		const bullet = world.tryGet(entity1, Bullet)
		if (bullet) {
			applyDamage(world, entity2, bullet.damage)
			world.destroy(entity1)
		}
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
			console.log(`entity ${e} destroyed`)
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