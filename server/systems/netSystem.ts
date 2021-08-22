import {
  component,
  createImmutableRef,
  createQuery,
  useInit,
  useInterval,
  useMonitor,
  World
} from "@javelin/ecs"
import { createMessageProducer, encode } from "@javelin/net"

import { Player, SpriteData, Allegiance, Transform, HuntScore, Countdown, GameData, Log } from "../components"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { useClients } from "../effects"
import { Clock } from "@javelin/hrtime-loop"

const transforms = createQuery(Transform)
const players = createQuery(Player)
const logs = createQuery(Log, Allegiance)
const transformsSpriteData = createQuery(Transform, SpriteData, Allegiance)
const teamScores = createQuery(Allegiance, HuntScore)
const countdowns = createQuery(Countdown)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  transformsSpriteData(producer.attach)
  teamScores(producer.attach)
  countdowns(producer.attach)
  gameDatas(producer.attach)
  logs(producer.attach)
  return producer.take()
}

const useProducers = createImmutableRef(() => ({
  updateProducer: createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
  attachProducer: createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
}))
const gameDatas = createQuery(GameData)

let gameDataEntity
let gameData: any

export default function netSystem(world: World<Clock>) {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const { updateProducer, attachProducer } = useProducers()

  if (useInit()) {
    gameData = component(GameData, { tick: world.latestTick })
    gameDataEntity = world.create(gameData)
  }

  if (gameData) {
    gameData.tick = world.latestTick
  }

  gameDatas(updateProducer.update)
  countdowns(updateProducer.update)

  useMonitor(transformsSpriteData, attachProducer.attach, attachProducer.destroy)
  transforms(updateProducer.update)

  useMonitor(teamScores, attachProducer.attach, attachProducer.destroy)
  teamScores(updateProducer.update)

  useMonitor(countdowns, attachProducer.attach, attachProducer.destroy)

  //TODO: only send logs to player who created them
  logs(updateProducer.update)

  if (send) {
    const attachMessage = attachProducer.take()
    const updateMessage = updateProducer.take()
    players((e, [player]) => {
      if (player.initialized) {
        const attachPacket = attachMessage
        const updatePacket = updateMessage
        if (updatePacket) {
          clients.sendUnreliable(player.uid, encode(updatePacket))
        }
      } else {
        const initPacket = getInitialMessage(world)
        player.initialized = true
        if (initPacket) {
          clients.sendReliable(player.uid, encode(initPacket))
        }
      }
    })
  }
}