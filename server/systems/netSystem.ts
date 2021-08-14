import {
  createEffect,
  createImmutableRef,
  createQuery,
  Entity,
  useInterval,
  useMonitor,
  World
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { createMessageProducer, encode } from "@javelin/net"
import * as admin from 'firebase-admin'
import http from 'http'

import { Player, SpriteData, Team, Transform } from "../components"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { geckos, ServerChannel } from "@geckos.io/server"
import createPlayer from "../factories/createPlayer"

const transforms = createQuery(Transform)
const players = createQuery(Player)
const transformsSpriteData = createQuery(Transform, SpriteData, Team)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  transformsSpriteData(producer.attach)
  return producer.take()
}

export const usePlayers = createEffect(world => {
  const players = new Map()
  return () => players
}, { shared: true })

const authenticate = async (
  token: string | undefined,
  req: http.IncomingMessage,
  res: http.OutgoingMessage
) => {
  if (token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const uid = decodedToken.uid
      return { uid }
    } catch (error) {
      console.log(error)
      return false
    }
  }
  return false
}
const useClients = createEffect((world: World<Clock>) => {
  const players = usePlayers()
  const clients = new Map()
  const send_u = (entity: Entity, data: ArrayBuffer) =>
    clients.get(entity).send(data)
  const api = { send_u }

  const io = geckos({
    authorization: authenticate,
    cors: { allowAuthorization: true, origin: '*' }
  })

  io.onConnection((channel: ServerChannel) => {
    const { uid } = channel.userData
    const player = createPlayer(world, uid)

    channel.onDisconnect(() => {
      world.destroy(player)
      //world.destroy(spawner)
      clients.delete(player)
    })
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
        packet = getInitialMessage(world)
        p.initialized = true
      }
      if (packet) {
        clients.send_u(e, encode(packet))
      }
    })
  }
}