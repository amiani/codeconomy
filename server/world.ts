import {
  component,
  createWorld,
  useInit,
  Entity,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
const rapier = require("@a-type/rapier2d-node")

import {
  Transform,
  Spawner,
  Team
} from "./components"
import scriptSystem from "./systems/scriptSystem"
import physicsSystem from './systems/physicsSystem'
import netSystem from './systems/netSystem'
import collisionTopic from "./collisionTopic"
import damageSystem from "./systems/damageSystem"
import spawnerSystem from "./systems/spawnerSystem"
import createShip from "./createShip"

export const world = createWorld<Clock>({
  topics: [collisionTopic]
})


const createSpawner = (e: Entity, x: number, y: number, team: number) => {
  console.log(`Creating spawner at ${x}, ${y}`)
  world.attach(e,
    component(Transform, { x, y }),
    component(Spawner, { 
      timer: { current: 0, max: 10 }
    }),
    component(Team, { id: team }),
  )
}

world.addSystem(function spawn(world) {
  if (useInit()) {
    //createShip(world, -10, 0, 0)
    createSpawner(world.create(), -10, 0, 0)
    createSpawner(world.create(), 10, 10, 1)
  }
})

world.addSystem(spawnerSystem)
world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(netSystem)