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

import { Player, SpriteData, Allegiance, Transform, HuntScore, Countdown, GameData, Log, CombatHistory, Bullet } from "../components"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { useClients } from "../effects"
import { Clock } from "@javelin/hrtime-loop"
import { Header, MessageType } from "../../common/types"

const playerQuery = createQuery(Player)
const logQuery = createQuery(Log, Allegiance)
const visibleQuery = createQuery(Transform, SpriteData, Allegiance)
const scoreQuery = createQuery(Allegiance, HuntScore)
const countdownQuery = createQuery(Countdown)
const gamedataQuery = createQuery(GameData)
const shipQuery = createQuery(Transform, CombatHistory).select(Transform)
const bulletQuery = createQuery(Bullet)

function getInitialMessage(e: Entity, player: ComponentOf<typeof Player>) {
  const producer = createMessageProducer()
  producer.attach(e, [player])
  visibleQuery(producer.attach)
  scoreQuery(producer.attach)
  countdownQuery(producer.attach)
  gamedataQuery(producer.attach)
  bulletQuery(producer.attach)
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

  useMonitor(visibleQuery, attachProducer.attach, attachProducer.destroy)
  useMonitor(scoreQuery, attachProducer.attach, attachProducer.destroy)
  useMonitor(countdownQuery, attachProducer.attach, attachProducer.destroy)
  useMonitor(bulletQuery, attachProducer.attach)
  useMonitor(
    logQuery,
    (e, [log, allegiance]) => {
      try {
        const player = world.get(allegiance.player, Player)
        const attachProducer = clients.getAttachProducer(player.uid)
        attachProducer.attach(e, [log])
      } catch (err) {
      }
    }
  )

  gamedataQuery(updateProducer.update)
  countdownQuery(updateProducer.update)
  scoreQuery(updateProducer.update)
  //ships
  for (const [entities, [transforms]] of shipQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      updateProducer.update(entities[i], [transforms[i]])
    }
  }
  //logs
  for (const [entities, [logs, allegiances]] of logQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      if (logs[i].logs.length > 0) {
        try {
          const player = world.get(allegiances[i].player, Player)
          const updateProducer = clients.getUpdateProducer(player.uid)
          updateProducer.update(entities[i], [logs[i]])
        } catch (err) {
        }
      }
    }
  }

  if (send) {
    const attachHeader: Header = { tick: world.latestTick, type: MessageType.Attach }
    const updateHeader: Header = { tick: world.latestTick, type: MessageType.Attach }
    const attachMessage = attachProducer.take()
    const updateMessage = updateProducer.take()
    playerQuery((e, [player]) => {
      if (player.initialized) {
        if (attachMessage) {
          clients.sendReliable(player.uid, attachHeader, encode(attachMessage))
        }
        if (updateMessage) {
          clients.sendUnreliable(player.uid, updateHeader, encode(updateMessage))
        }
      } else {
        const initMessage = getInitialMessage(e, player)
        if (initMessage) {
          clients.sendReliable(player.uid, attachHeader, encode(initMessage), (err) => {
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
