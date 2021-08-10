import {
  createWorld,
  useInit,
  toComponent,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from 'isolated-vm'

import scriptSystem from "./systems/scriptSystem"
import physicsSystem from './systems/physicsSystem'
import netSystem from './systems/netSystem'
import collisionTopic from "./collisionTopic"
import scriptTopic from "./scriptTopic"
import damageSystem from "./systems/damageSystem"
import spawnerSystem from "./systems/spawnSystem"
import createSpawner from "./createSpawner"
import { Isolate, Script } from "./components"
import testScript from "../scripts/testScript"

export const world = createWorld<Clock>({
  topics: [
    collisionTopic,
    scriptTopic
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
    createSpawner(world, 10, 10, 1, owner)
  }
})

world.addSystem(spawnerSystem)
world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(netSystem)