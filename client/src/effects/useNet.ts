import { createEffect, useInterval } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import { Packet } from '../../../common/types'
import { actions } from '../ui/state'
import useClient from './useClient'

const SEND_RATE = 20
export default createEffect(world => {
    const { getInitPacket, attachPackets, updatePackets } = useClient()
    const state = { bytes: 0 }
    const handler = createMessageHandler(world)
    let initialized = false
    let latestUpdateTick = 0


    const consumeMessage = (packet: Packet) => {
      state.bytes += packet.message.byteLength + 5
      handler.push(packet.message)
    }

    const updateRate = (1 / SEND_RATE) * 1000
    let nextUpdate = updateRate

    return () => {
      const update = useInterval(nextUpdate)
      if (initialized) {
        while (attachPackets.length && attachPackets[0].header.tick <= latestUpdateTick) {
          const packet = attachPackets.shift()
          if (packet) {
            consumeMessage(packet)
          }
        }

        if (update) {
          if (updatePackets.length) {
            const packet = updatePackets.shift()
            if (packet && packet.header.tick > latestUpdateTick) {
              consumeMessage(packet)
              latestUpdateTick = packet.header.tick
              actions.setTick(latestUpdateTick)
            } else {
              //console.log(`discarding update packet ${packet.header.tick}`)
            }
          }
          nextUpdate = updatePackets.length > 8 ? (updateRate * .99) : updateRate * 1.05
        }
      } else if (getInitPacket()) {
        initialized = true
        const packet = getInitPacket()
        latestUpdateTick = packet.header.tick
        consumeMessage(packet)
        console.log('initialized')
      }

      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)