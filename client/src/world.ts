import {
  createWorld,
} from "@javelin/ecs"

import clientSystem from './systems/clientSystem'
import spriteSystem from './systems/spriteSystem'

export const world = createWorld()

world.addSystem(clientSystem)
world.addSystem(spriteSystem)