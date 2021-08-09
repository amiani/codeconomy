import {
	component,
	createEffect,
	createImmutableRef,
	createQuery,
	Entity,
	toComponent,
	useInterval,
	useMonitor,
	World
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { createMessageProducer, encode } from "@javelin/net"
import * as admin from 'firebase-admin'
import ivm from 'isolated-vm'

import { Isolate, Player, SpriteData, Transform } from "../components"
import createSpawner from "../createSpawner"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { udp } from "../net"

const transforms = createQuery(Transform)
const players = createQuery(Player)
const transformsSpriteData = createQuery(Transform, SpriteData)
const spriteDatas = createQuery(SpriteData)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  transforms(producer.attach)
  spriteDatas(producer.attach)
  return producer.take()
}

export const usePlayers = createEffect(world => {
  const players = new Map()
  return () => players
}, { shared: true })

const useClients = createEffect((world: World<Clock>) => {
  const players = usePlayers()
  const clients = new Map()
  const send_u = (entity: Entity, data: ArrayBuffer) =>
    clients.get(entity).send(data)
  const api = { send_u }

  udp.connections.subscribe(async connection => {
    const { token } = connection.metadata
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const uid = decodedToken.uid
      const isolate = new ivm.Isolate({ memoryLimit: 128 })
      const entity = world.create(
        component(Player, { uid }),
        toComponent(isolate, Isolate),
      )
      clients.set(entity, connection)
      players.set(uid, entity)

      createSpawner(world, -10, 0, 0, entity)

      connection.closed.subscribe(() => {
        world.destroy(entity)
        clients.delete(entity)
        players.delete(entity)
      })
    } catch (e) {
      console.error(e)
    }
  })

  return function useClients() {
    return api
  }
})

const useProducer = createImmutableRef(() =>
  createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
)

export default function netSystem(world: World) {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const producer = useProducer()

  useMonitor(
    transformsSpriteData,
    producer.attach,
    producer.destroy
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
        console.log('sending initial message')
        packet = getInitialMessage(world)
        p.initialized = true
      }
      if (packet) {
        clients.send_u(e, encode(packet))
      }
    })
  }
}