import {
  createImmutableRef,
  createQuery,
  useInterval,
  useMonitor,
  World
} from "@javelin/ecs"
import { createMessageProducer, encode } from "@javelin/net"

import { Player, SpriteData, Team, Transform } from "../components"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { useClients } from "../effects"

const transforms = createQuery(Transform)
const players = createQuery(Player)
const transformsSpriteData = createQuery(Transform, SpriteData, Team)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  transformsSpriteData(producer.attach)
  return producer.take()
}

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
    players((e, [player]) => {
      let packet
      if (player.initialized) {
        packet = message
      } else {
        packet = getInitialMessage(world)
        player.initialized = true
      }
      if (packet) {
        clients.sendUpdate(player.uid, encode(packet))
      }
    })
  }
}