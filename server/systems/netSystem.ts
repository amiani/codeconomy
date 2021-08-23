import {
  component,
  ComponentOf,
  createImmutableRef,
  createQuery,
  Entity,
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
const logsAllegiance = createQuery(Log, Allegiance)
const transformsSpriteData = createQuery(Transform, SpriteData, Allegiance)
const teamScores = createQuery(Allegiance, HuntScore)
const countdowns = createQuery(Countdown)
const gameDatas = createQuery(GameData)

function getInitialMessage(e: Entity, player: ComponentOf<typeof Player>) {
  const producer = createMessageProducer()
  producer.attach(e, [player])
  transformsSpriteData(producer.attach)
  teamScores(producer.attach)
  countdowns(producer.attach)
  gameDatas(producer.attach)
  return producer.take()
}

const useProducers = createImmutableRef(() => ({
  updateProducer: createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
  attachProducer: createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
}))

let gameData: any

export default function netSystem(world: World<Clock>) {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const { updateProducer, attachProducer } = useProducers()

  if (useInit()) {
    gameData = component(GameData, { tick: world.latestTick })
    world.create(gameData)
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
  useMonitor(
    logsAllegiance,
    (e, [log, allegiance]) => {
      try {
        const player = world.get(allegiance.player, Player)
        const attachProducer = clients.getAttachProducer(player.uid)
        attachProducer.attach(e, [log])
      } catch (err) {
      }
    }
  )

  logsAllegiance((e, [log, allegiance]) => {
    if (log.logs.length > 0) {
      try {
        const player = world.get(allegiance.player, Player)
        const updateProducer = clients.getUpdateProducer(player.uid)
        updateProducer.update(e, [log])
      } catch (err) {
      }
    }
  })

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
        const initMessage = getInitialMessage(e, player)
        if (initMessage) {
          clients.sendReliable(player.uid, encode(initMessage), (err) => {
            if (err) {
              console.error(err)
            } else {
              player.initialized = true
            }
          })
        }
      }
    })
  }
}