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
const transformsSpriteData = createQuery(Transform, SpriteData, Allegiance)
const teamScores = createQuery(Allegiance, HuntScore)
const countdowns = createQuery(Countdown)
const logs = createQuery(Log)

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  transformsSpriteData(producer.attach)
  teamScores(producer.attach)
  countdowns(producer.attach)
  gameDatas(producer.attach)
  logs(producer.attach)
  return producer.take()
}

const useProducer = createImmutableRef(() =>
  createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
)
const gameDatas = createQuery(GameData)

let gameDataEntity
let gameData: any

export default function netSystem(world: World<Clock>) {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const producer = useProducer()

  if (useInit()) {
    gameData = component(GameData, { tick: world.latestTick })
    gameDataEntity = world.create(gameData)
  }

  if (gameData) {
    gameData.tick = world.latestTick
  }

  gameDatas(producer.update)
  countdowns(producer.update)

  useMonitor(transformsSpriteData, producer.attach, producer.destroy)
  transforms(producer.update)

  useMonitor(teamScores, producer.attach, producer.destroy)
  teamScores(producer.update)

  useMonitor(countdowns, producer.attach, producer.destroy)

  //TODO: only send logs to player who created them
  useMonitor(logs, producer.attach, producer.destroy)
  logs(producer.update)

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