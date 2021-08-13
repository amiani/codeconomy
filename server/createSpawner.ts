import { component, Entity, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Script, Spawner, SpriteData, Team, Transform } from "./components"

export default (
	world: World<Clock>,
	x: number,
	y: number,
	team: number,
  owner: Entity,
): Entity => {
  console.log(`Creating spawner at ${x}, ${y}`)
  const e = world.create()
  world.attach(e,
    component(Transform, { x, y }),
    component(Spawner, { 
      timer: { current: 0, max: 10 },
      owner
    }),
    component(Team, { id: team }),
    component(SpriteData, { name: "spawn2" }),
  )
  return e
}