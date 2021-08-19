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
import ffaSystem from "./systems/ffaSystem"
import { useTeams } from "./effects"

export const world = createWorld<Clock>({
  topics: [
    collisionTopic,
    scriptTopic,
    shipTopic,
    playerTopic,
  ]
})

world.addSystem(function spawn(world) {
  const teams = useTeams()
  if (useInit()) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
    const script = isolate.compileScriptSync(testScript)
    const owner = world.create(
      toComponent(script, Script),
      toComponent(isolate, Isolate)
    )
    const team = teams.assign(owner)
    createSpawner(world, 0, 0, 0, owner, team, 2, "spawn2")

  }
})

world.addSystem(spawnSystem)
world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(ffaSystem)
world.addSystem(huntSystem)
world.addSystem(netSystem)