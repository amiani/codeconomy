import {
  createWorld,
} from "@javelin/ecs"
import laserTopic from "./topics/laserTopic"

import { clientSystem, interpolateSystem, soundSystem, spriteSystem } from './systems'
import { uploadTopic } from "./topics"

export const world = createWorld({
  topics: [
    laserTopic,
    uploadTopic
  ]
})

world.addSystem(clientSystem)
world.addSystem(interpolateSystem)
world.addSystem(spriteSystem)
world.addSystem(soundSystem)