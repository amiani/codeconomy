import { component, Entity, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Spawner, SpriteData, Allegiance, Transform } from "../components"

export default (
	world: World<Clock>,
	x: number,
	y: number,
  rotation: number,
  player: Entity,
	team: number,
  spawnTime: number,
  spriteName = "spawn2"
): Entity => {
  console.log(`Creating spawner at ${x}, ${y}`)
  const e = world.create()
  world.attach(e,
    component(Transform, { x, y, rotation }),
    component(Spawner, { countdown: { current: 0, max: spawnTime } }),
    component(Allegiance, { player, team }),
    component(SpriteData, { name: spriteName }),
  )
  return e
}