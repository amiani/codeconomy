import { createEffect, useInterval, World } from '@javelin/ecs'
import { createMessageHandler } from '@javelin/net'
import { Client } from "@web-udp/client"
import firebase from 'firebase'
import 'firebase/auth'


export const useNet = createEffect(
  world => {
    const state = { bytes: 0 }
    const client = new Client({
      url: `${window.location.hostname}:8000`,
    })
    const handler = createMessageHandler(world)
    const messages = Array<ArrayBuffer>()

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token: string = await user.getIdToken(true)
        const connection = await client.connect({ metadata: { token } })
        connection.messages.subscribe((message: ArrayBuffer) => {
          messages.push(message)
        })
      }
    })

    const consumeMessage = () => {
      const message = messages.shift() as ArrayBuffer
      state.bytes += message.byteLength
      handler.push(message)
    }


    let nextUpdate = 100

    return () => {
      let update = useInterval(nextUpdate)
      while (messages.length > 20) {
        consumeMessage()
      }
      if (update) {
        if (messages.length) {
          consumeMessage()
        }
        nextUpdate = messages.length > 10 ? 100 : 105
      }
      console.log(messages.length)
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)

export default function clientSystem(world: World) {
	const net = useNet()
}