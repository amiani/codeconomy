import {
  component,
  toComponent,
  createWorld,
  useInit,
  Entity,
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
  Action,
  Weapon,
  Health
} from "./components"
import testScript from './testScript'
import scriptSystem from "./systems/scriptSystem"
import physicsSystem from './systems/physicsSystem'
import netSystem from './systems/netSystem'
import useSimulation from './simulation'
import useIsolates, { createContext } from './isolates'
import useColliderToEntity from './colliderToEntity'
import collisionTopic from "./collisionTopic"
import damageSystem from "./systems/damageSystem"

export const world = createWorld<Clock>({
  topics: [collisionTopic]
})

const createShip = (e: Entity, x = 0, y = 0, team = 0) => {
  const bodyDesc = rapier.RigidBodyDesc.newDynamic()
    .setTranslation(x, y)
    .setRotation(Math.PI * team)
    .setLinearDamping(0.9)
    .setAngularDamping(0.9)
  const colliderDesc = rapier.ColliderDesc.cuboid(1, 1)
		.setCollisionGroups(0x00010000 * (team+1) + 0x0004 * (2-team))
    .setActiveEvents(
      rapier.ActiveEvents.CONTACT_EVENTS
      | rapier.ActiveEvents.INTERSECTION_EVENTS)
  
  const sim = useSimulation()
  const body = sim.createRigidBody(bodyDesc)
  const collider = sim.createCollider(colliderDesc, body.handle)
  const colliderToEntity = useColliderToEntity()
  colliderToEntity.set(collider.handle, e)
  

  const isolates = useIsolates()
  const isolate = isolates[team]
  const script = isolate.compileScriptSync(testScript)
  const context = createContext(isolate)
  world.attach(e,
    toComponent(body, Body),
    component(Transform, { x, y }),
    toComponent(script, Script),
    toComponent(context, Context),
		component(Weapon, { damage: 1, maxCooldown: 0.3, currentCooldown: 0 }),
    component(Team, { id: team }),
    component(SpriteData, { name: "ship" }),
    component(Action),
    component(Health, { current: 100, max: 100 })
  )
}

world.addSystem(function spawn({ create, attach }) {
  if (useInit()) {
    createShip(create(), -10, 0, 0)
    createShip(create(), 10, 0, 1)
  }
})

world.addSystem(scriptSystem)
world.addSystem(physicsSystem)
world.addSystem(damageSystem)
world.addSystem(netSystem)