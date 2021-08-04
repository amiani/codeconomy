import {
  component,
  toComponent,
  createWorld,
  useInit,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
const rapier = require("@a-type/rapier2d-node")

import {
  Transform,
  Body,
  Script,
  Context,
  SpriteData,
  Team,
  Action
} from "./components"
import testScript from './systems/testScript'
import scriptSystem from "./systems/scriptSystem"
import physicsSystem from './systems/physicsSystem'
import netSystem from './systems/netSystem'
import useSimulation from './simulation'
import useIsolates, { createContext } from './isolates'

export const world = createWorld<Clock>()

const createShip = (x = 0, y = 0, team = 0) => {
  const bodyDesc = rapier.RigidBodyDesc.newDynamic()
    .setTranslation(x, y)
    .setLinearDamping(0.9)
    .setAngularDamping(0.9)
  const colliderDesc = rapier.ColliderDesc.cuboid(1, 1)
  
  const physics = useSimulation()
  const body = physics.createRigidBody(bodyDesc)
  physics.createCollider(colliderDesc, body.handle)

  const { isolates, contexts } = useIsolates()
  const isolate = isolates[team]
  const script = isolate.compileScriptSync(testScript)
  const context = createContext(isolate)
  return [
    toComponent(body, Body),
    component(Transform, { x, y }),
    toComponent(script, Script),
    toComponent(context, Context),
    component(Team, { id: team }),
    component(SpriteData, { name: "ship" }),
    component(Action)
  ]
}

world.addSystem(function spawn({ create }) {
  if (useInit()) {
    // spawn boxes at semi-random points
    create(...createShip(-10, 0, 0))
    create(...createShip(10, 0, 1))
  }
})

world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(netSystem)