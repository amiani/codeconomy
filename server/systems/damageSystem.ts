import { createQuery, Entity, World } from "@javelin/ecs";
import collisionTopic from "../collisionTopic"
import { Bullet, Health } from "../components"

const healths = createQuery(Health)

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
			world.destroy(collision.entity1)
		}
		bullet = world.tryGet(collision.entity2, Bullet)
		if (bullet) {
			tryDamage(world, collision.entity1, bullet.damage)
			world.destroy(collision.entity2)
		}
	}

	healths((e, [health]) => {
		if (health.current <= 0) {
			console.log(`entity ${e} destroyed`)
			world.destroy(e)
		}
	})
}