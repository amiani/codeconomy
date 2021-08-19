import {
  createWorld,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"

import { damageSystem, huntSystem, netSystem, physicsSystem, scriptSystem, spawnSystem } from "./systems"
import { collisionTopic, playerTopic, scriptTopic, shipTopic } from "./topics"
import ffaSystem from "./systems/ffaSystem"

export const world = createWorld<Clock>({
  topics: [
    collisionTopic,
    scriptTopic,
    shipTopic,
    playerTopic,
  ]
})

world.addSystem(spawnSystem)
world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(ffaSystem)
world.addSystem(huntSystem)
world.addSystem(netSystem)