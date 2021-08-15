import { RawMessage } from '@geckos.io/client'
import { createEffect, useInterval } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import useClient from './useClient'

export default createEffect(world => {
    const { messages } = useClient()
    const state = { bytes: 0 }
    const handler = createMessageHandler(world)


    const consumeMessage = () => {
      const message = messages.shift() as ArrayBuffer
      state.bytes += message.byteLength
      handler.push(message)
    }


    let nextUpdate = 100

    return () => {
      let update = useInterval(nextUpdate)
      while (messages.length > 16) {
        consumeMessage()
      }
      if (update) {
        if (messages.length) {
          consumeMessage()
        }
        nextUpdate = messages.length > 8 ? 100 : 105
      }
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)