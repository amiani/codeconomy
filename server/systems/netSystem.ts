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

function getInitialMessage() {
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
  transforms(updateProducer.update)
  teamScores(updateProducer.update)

  useMonitor(transformsSpriteData, attachProducer.attach, attachProducer.destroy)
  useMonitor(teamScores, attachProducer.attach, attachProducer.destroy)
  useMonitor(countdowns, attachProducer.attach, attachProducer.destroy)

  //TODO: only send logs to player who created them
  /*
  logs((e, [log, allegiance]) => {
    try {
      const player = world.get(allegiance.player, Player)
      clients.getPlayer(player.uid)
    } catch (err) {
    }
  })
  */

  if (send) {
    const attachMessage = attachProducer.take()
    const updateMessage = updateProducer.take()
    players((e, [player]) => {
      if (player.initialized) {
        if (attachMessage) {
          clients.sendReliable(player.uid, encode(attachMessage))
        }
        if (updateMessage) {
          clients.sendUnreliable(player.uid, encode(updateMessage))
        }
      } else {
        const initMessage = getInitialMessage()
        player.initialized = true
        if (initMessage) {
          clients.sendReliable(player.uid, encode(initMessage))
        }
      }
    })
  }
}