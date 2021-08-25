import { createEffect, useInterval } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import useClient from './useClient'

const SEND_RATE = 20
export default createEffect(world => {
    const { messages } = useClient()
    const state = { bytes: 0 }
    const handler = createMessageHandler(world)


    const consumeMessage = () => {
      const message = messages.shift() as ArrayBuffer
      state.bytes += message.byteLength
      handler.push(message)
    }

    const updateRate = (1 / SEND_RATE) * 1000
    let nextUpdate = updateRate

    return () => {
      let update = useInterval(nextUpdate)
      while (messages.length > 16) {
        consumeMessage()
      }
      if (update) {
        console.log(messages.length)
        if (messages.length) {
          consumeMessage()
        }
        nextUpdate = messages.length > 8 ? updateRate : updateRate * 1.05
      }
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)