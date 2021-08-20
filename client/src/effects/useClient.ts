import { createEffect } from "@javelin/ecs";
import geckos, { ClientChannel, RawMessage } from '@geckos.io/client'
import firebase from 'firebase'
import 'firebase/auth'

interface Client {
  socket: WebSocket,
  channel: ClientChannel,
}

const HOSTNAME = '35.185.102.25'

export default createEffect(world => {
    let client: Client
	const messages = Array<ArrayBuffer>()

    firebase.auth().onAuthStateChanged(async user => {
		if (user) {
			const token: string = await user.getIdToken(true)
			const socket = new WebSocket(`ws://${HOSTNAME}:8001/connect?authorization=${token}`)
			socket.binaryType = 'arraybuffer'
			socket.onopen = (ev: Event) => {
				const url = `http://${HOSTNAME}`
				const channel = geckos({
					url: url,
					port: 8000,
					authorization: token
				})

				channel.onConnect(error => {
					if (error) {
						console.error(error.message)
						return
					}
					client = { socket, channel }

					channel.onRaw((message: RawMessage) => {
						if (message instanceof ArrayBuffer) {
							messages.push(message)
						}
					})
					console.log('connected')
				})
			}
		}
    })

	return () => ({
		client,
		messages
	})
}, { shared: true })