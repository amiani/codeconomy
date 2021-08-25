import {
  createWorld,
} from "@javelin/ecs"
import laserTopic from "./topics/laserTopic"

import { cameraSystem, clientSystem, interpolateSystem, soundSystem, spriteSystem } from './systems'
import { uploadTopic } from "./topics"
import huntScoreDisplaySystem from "./systems/huntScoreDisplaySystem"
import logSystem from "./systems/logSystem"

export const world = createWorld({
  topics: [
    laserTopic,
    uploadTopic,
  ]
})

world.addSystem(clientSystem)
world.addSystem(interpolateSystem)
world.addSystem(spriteSystem)
world.addSystem(soundSystem)
world.addSystem(huntScoreDisplaySystem)
world.addSystem(logSystem)
world.addSystem(cameraSystem)