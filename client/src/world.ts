import {
  createWorld,
} from "@javelin/ecs"

import clientSystem from './systems/clientSystem'
import interpolateSystem from "./systems/interpolateSystem"
import spriteSystem from './systems/spriteSystem'

export const world = createWorld()

world.addSystem(clientSystem)
world.addSystem(interpolateSystem)
world.addSystem(spriteSystem)