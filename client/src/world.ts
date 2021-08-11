import {
  createWorld,
} from "@javelin/ecs"
import laserTopic from "./laserTopic"

import clientSystem from './systems/clientSystem'
import interpolateSystem from "./systems/interpolateSystem"
import soundSystem from "./systems/soundSystem"
import spriteSystem from './systems/spriteSystem'

export const world = createWorld({
  topics: [
    laserTopic
  ]
})

world.addSystem(clientSystem)
world.addSystem(interpolateSystem)
world.addSystem(spriteSystem)
world.addSystem(soundSystem)