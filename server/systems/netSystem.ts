import {
  createImmutableRef,
  createQuery,
  Entity,
  useInterval,
  useMonitor,
  World
} from "@javelin/ecs"
import { createMessageProducer, encode, MessageProducer } from "@javelin/net"

import { Player, SpriteData, Allegiance, Transform, HuntScore, Countdown, Log, CombatHistory, Bullet, Spawner, GamePhase } from "../components"
import { MESSAGE_MAX_BYTE_LENGTH, SEND_RATE } from "../env"
import { useClients } from "../effects"
import { Clock } from "@javelin/hrtime-loop"
import { Header, MessageType } from "../../common/types"

const playerQuery = createQuery(Player)
const logQuery = createQuery(Log, Allegiance)
const visibleQuery = createQuery(Transform, SpriteData, Allegiance)
const scoreQuery = createQuery(Allegiance, HuntScore)
const countdownQuery = createQuery(Countdown)
const shipQuery = createQuery(Transform, CombatHistory).select(Transform)
const bulletQuery = createQuery(Bullet)
const spawnerQuery = createQuery(Spawner)
const phaseQuery = createQuery(GamePhase)

function getInitialMessage(producer: MessageProducer, playerEntity: Entity) {
  const attach = producer.attach.bind(producer)
  phaseQuery(attach)
  playerQuery(attach)
  visibleQuery(attach)
  scoreQuery(attach)
  countdownQuery(attach)
  bulletQuery(attach)
  spawnerQuery(attach)
  logQuery((e, [log, allegiance]) => {
    if (allegiance.player == playerEntity) {
      attach(e, [log])
    }
  })
  return producer.take()
}

const useProducers = createImmutableRef(() => ({
  updateProducer: createMessageProducer({ maxByteLength: MESSAGE_MAX_BYTE_LENGTH }),
  attachProducer: createMessageProducer({ maxByteLength: Infinity }),
}))

export default function netSystem(world: World<Clock>) {
  const shouldSend = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const { updateProducer, attachProducer } = useProducers()

  const attach = attachProducer.attach.bind(attachProducer)
  const destroy = attachProducer.destroy.bind(attachProducer)
  useMonitor(phaseQuery, attach, destroy)
  useMonitor(visibleQuery, attach, destroy)
  useMonitor(scoreQuery, attach, destroy)
  useMonitor(countdownQuery, attach, destroy)
  useMonitor(bulletQuery, attach)
  useMonitor(spawnerQuery, attach)
  /*
  useMonitor(
    logQuery,
    (e, [log, allegiance]) => {
      try {
        const player = world.get(allegiance.player, Player)
        const attachProducer = clients.getAttachProducer(player.uid)
        attachProducer.attach(e, [log])
      } catch (err) {
        console.log(err)
      }
    }
  )
  */
  
  const update = updateProducer.update.bind(updateProducer)
  phaseQuery(update)
  countdownQuery(update)
  scoreQuery(update)
  //ships
  for (const [entities, [transforms]] of shipQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      update(entities[i], [transforms[i]])
    }
  }
  /*
  //logs
  for (const [entities, [logs, allegiances]] of logQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      if (logs[i].logs.length > 0) {
        try {
          const player = world.get(allegiances[i].player, Player)
          const updateProducer = clients.getUpdateProducer(player.uid)
          updateProducer.update(entities[i], [logs[i]])
        } catch (err) {
          console.log(err)
        }
      }
    }
  }
  */

  if (shouldSend) {
    const attachHeader: Header = { tick: world.latestTick, type: MessageType.Attach }
    const updateHeader: Header = { tick: world.latestTick, type: MessageType.Update }
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
        const producer = clients.getAttachProducer(player.uid)
        if (!producer) {
          return
        }
        const initMessage = getInitialMessage(producer, e)
        if (initMessage) {
          const initHeader: Header = { tick: world.latestTick, type: MessageType.Init }
          clients.sendReliable(player.uid, initHeader, encode(initMessage), (err) => {
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