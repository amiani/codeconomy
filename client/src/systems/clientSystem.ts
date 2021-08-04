import { createEffect, World } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import { Client } from "@web-udp/client"

const useNet = createEffect(
  world => {
    const state = { bytes: 0 }
    const client = new Client({
      url: `${window.location.hostname}:8000`,
    })
    const handler = createMessageHandler(world)

    client.connect().then(c =>
      c.messages.subscribe(message => {
        state.bytes += message.byteLength
        handler.push(message)
      }),
    )

    return () => {
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)

export default function clientSystem(world: World) {
	const net = useNet()
}