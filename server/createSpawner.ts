import { component, Entity, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Spawner, Team, Transform } from "./components"

export default (
	world: World<Clock>,
	x: number,
	y: number,
	team: number,
	owner: number
): void => {
  console.log(`Creating spawner at ${x}, ${y}`)
  world.attach(world.create(),
    component(Transform, { x, y }),
    component(Spawner, { 
      timer: { current: 0, max: 10 },
      owner
    }),
    component(Team, { id: team }),
  )
}