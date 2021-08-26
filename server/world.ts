import {
  createWorld,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"

import { damageSystem, huntSystem, netSystem, physicsSystem, moduleSystem, spawnSystem } from "./systems"
import {
  collisionTopic,
  logTopic,
  playerTopic,
  moduleTopic,
  shipTopic,
} from "./topics"
import ffaSystem from "./systems/ffaSystem"
import bulletSystem from "./systems/bulletSystem"
import logSystem from "./systems/logSystem"

export const world = createWorld<Clock>({
  topics: [
    collisionTopic,
    moduleTopic,
    shipTopic,
    playerTopic,
    logTopic
  ]
})

world.addSystem(spawnSystem)
world.addSystem(moduleSystem)
world.addSystem(physicsSystem)
world.addSystem(bulletSystem)
world.addSystem(damageSystem)
world.addSystem(ffaSystem)
world.addSystem(huntSystem)
world.addSystem(netSystem)
world.addSystem(logSystem)