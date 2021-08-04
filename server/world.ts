import {
  component,
  toComponent,
  ComponentOf,
  createEffect,
  createImmutableRef,
  createQuery,
  createWorld,
  Entity,
  observe,
  useInterval,
  useMonitor,
  useInit,
  World,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { createMessageProducer, encode } from "@javelin/net"
const rapier = require("@a-type/rapier2d-node")

import {
  Player,
  Transform,
  Body,
  Script,
  Context,
  SpriteData,
  Team,
  Action
} from "./components"
import {
  MESSAGE_MAX_BYTE_LENGTH,
  SEND_RATE,
} from "./env"
import { udp } from "./net"
import testScript from './systems/testScript'
import scriptSystem from "./systems/scriptSystem"
import physicsSystem from './systems/physicsSystem'
import useSimulation from './simulation'
import useIsolates, { createContext } from './isolates'

export const world = createWorld<Clock>()

const transforms = createQuery(Transform)
const players = createQuery(Player)
const transformsSpriteData = createQuery(Transform, SpriteData)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  for (const [entities, [transforms, spriteDatas]] of transformsSpriteData) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const t = transforms[i]
      const s = spriteDatas[i]
      producer.attach(e, [t, s])
    }
  }
  console.log('get initial')
  /*
  transformsSpriteData((e, [transform, data]) => {
    producer.attach(e, [transform, data])
  })
  */
  return producer.take()
}

const useClients = createEffect(({ create, destroy }) => {
  const clients = new Map()
  const send_u = (entity: Entity, data: ArrayBuffer) =>
    clients.get(entity).send(data)
  const api = { send_u }

  udp.connections.subscribe(connection => {
    const entity = create(component(Player))
    clients.set(entity, connection)
    connection.closed.subscribe(() => {
      destroy(entity)
      clients.delete(entity)
    })
  })

  return function useClients() {
    return api
  }
})

const useProducer = createImmutableRef(() =>
  createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
)

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

world.addSystem(world => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const producer = useProducer()

  useMonitor(
    transforms,
    producer.attach,
    producer.detach
  )
  transforms((e, [transform]) => {
    producer.update(e, [transform])
  })

  if (send) {
    const message = producer.take()
    players((e, [p]) => {
      let packet
      if (p.initialized) {
        packet = message
      } else {
        packet = getInitialMessage(world)
        p.initialized = true
      }
      if (packet) {
        clients.send_u(e, encode(packet))
      }
    })
  }
})