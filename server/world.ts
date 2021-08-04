import {
  Component,
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
import { Clock, createHrtimeLoop } from "@javelin/hrtime-loop"
import { createMessageProducer, encode } from "@javelin/net"
const rapier = require("@a-type/rapier2d-node")

import { Player, Transform, Body, Script, Team } from "./components"
import {
  MESSAGE_MAX_BYTE_LENGTH,
  SEND_RATE,
  TICK_RATE,
} from "./env"
import { udp } from "./net"
import testScript from './systems/testScript'
import scriptSystem from "./systems/scriptSystem"
import usePhysics from './physics'
import useIsolates from './isolates'

export const world = createWorld<Clock>()

const players = createQuery(Player)
const transforms = createQuery(Transform)
const transformsBody = createQuery(Transform, Body)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  for (const [entities, [transforms, bodies]] of transformsBody) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const t = transforms[i]
      const b = bodies[i]
      producer.attach(e, [t, b])
    }
  }
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

function createShip(x = 0, y = 0, team = 0) {
  const bodyDesc = rapier.RigidBodyDesc.newDynamic()
    .setTranslation(x, y)
    .setLinearDamping(0.9)
    .setAngularDamping(0.9)
  
  const physics = usePhysics()
  const body = physics.createRigidBody(bodyDesc)
  const colliderDesc = rapier.ColliderDesc.cuboid(1, 1)
  physics.createCollider(colliderDesc, body.handle)

  const { isolates, contexts } = useIsolates()
  const script = isolates[0].compileScriptSync(testScript)
  return [
    toComponent(body, Body),
    component(Transform, { x, y }),
    toComponent(script, Script),
    component(Team, { id: team }),
  ]
}

function copyBodyToTransform(
  body: typeof rapier.Body,
  transform: ComponentOf<typeof Transform>)
{
  const translation = body.translation()
  transform.x = translation.x
  transform.y = translation.y
  transform.rotation = body.rotation()
}

world.addSystem(function spawn({ create }) {
  if (useInit()) {
    // spawn boxes at semi-random points
    create(...createShip(-10, 0, 0))
    create(...createShip(10, 0, 1))
  }
})

world.addSystem(scriptSystem)

world.addSystem(function physics({ latestTickData: dt }) {
  const physics = usePhysics()
  physics.step()
})

world.addSystem(world => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const producer = useProducer()

  useMonitor(
    transformsBody,
    producer.attach,
    producer.detach
  )

  transformsBody((e, [transform, body]) => {
    copyBodyToTransform(body, transform)
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