import {
  createWorld,
  useInit,
  toComponent,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from 'isolated-vm'

import { damageSystem, huntSystem, netSystem, physicsSystem, scriptSystem, spawnSystem } from "./systems"
import { collisionTopic, playerTopic, scriptTopic, shipTopic } from "./topics"
import { createSpawner } from "./factories"
import { Isolate, Script } from "./components"
import testScript from "../scripts/testScript"

export const world = createWorld<Clock>({
  topics: [
    collisionTopic,
    scriptTopic,
    shipTopic,
    playerTopic,
  ]
})


world.addSystem(function spawn(world) {
  if (useInit()) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
    const script = isolate.compileScriptSync(testScript)
    const owner = world.create(
      toComponent(script, Script),
      toComponent(isolate, Isolate)
    )
    createSpawner(world, 0, 0, 0, owner, 0, 2, "spawn2")

  }
})

world.addSystem(spawnSystem)
world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(huntSystem)
world.addSystem(netSystem)