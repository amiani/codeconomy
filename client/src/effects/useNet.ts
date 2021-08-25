import { createEffect, useInterval } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import { Packet } from '../../../common/types'
import useClient from './useClient'

const SEND_RATE = 20
export default createEffect(world => {
    const { attachPackets, updatePackets } = useClient()
    const state = { bytes: 0 }
    const handler = createMessageHandler(world)
    let latestUpdateTick = 1000


    const consumeMessage = (packet: Packet) => {
      state.bytes += packet.message.byteLength
      handler.push(packet.message)
    }

    const updateRate = (1 / SEND_RATE) * 1000
    let nextUpdate = updateRate

    return () => {
      while (attachPackets.length && attachPackets[0].header.tick <= latestUpdateTick) {
        const packet = attachPackets.shift()
        if (packet) {
          console.log(`consuming attach packet ${packet.header.tick}`)
          consumeMessage(packet)
        }
      }

      let update = useInterval(nextUpdate)
      if (update) {
        console.log(updatePackets.length)
        if (updatePackets.length) {
          const packet = updatePackets.shift()
          if (packet) {
            console.log(`consuming update packet ${packet.header.tick}`)
            if (packet.header.tick <= latestUpdateTick) {
              console.log(`skipping update packet ${packet.header.tick}`)
            }
            consumeMessage(packet)
            latestUpdateTick = packet.header.tick
          }
        }
        nextUpdate = updatePackets.length > 8 ? (updateRate * .95) : updateRate * 1.05
      }
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)