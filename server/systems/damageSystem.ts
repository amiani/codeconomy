import { createQuery, Entity, useMonitor, World } from "@javelin/ecs";
import collisionTopic from "../collisionTopic"
import { Body, Bullet, Health } from "../components"
import useSimulation from '../simulation'
import useColliderToEntity from '../colliderToEntity'
const rapier = require('@a-type/rapier2d-node')

const healths = createQuery(Health)
const bodies = createQuery(Body)

const tryDamage = (world: World, e: Entity, damage: number) => {
	const health = world.tryGet(e, Health)
	if (health) {
		console.log(`${damage} damage done to entity ${e}`)
		health.current -= damage
	}
}

export default function damageSystem(world: World) {
	for (const collision of collisionTopic) {
		let bullet = world.tryGet(collision.entity1, Bullet)
		if (bullet) {
			tryDamage(world, collision.entity2, bullet.damage)
			console.log(`Destroy ${collision.entity1}: bullet collided`)
			world.destroy(collision.entity1)
		}
		bullet = world.tryGet(collision.entity2, Bullet)
		if (bullet) {
			tryDamage(world, collision.entity1, bullet.damage)
			console.log(`Destroy ${collision.entity2}: bullet collided`)
			world.destroy(collision.entity2)
		}
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