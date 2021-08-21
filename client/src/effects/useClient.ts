import { createEffect } from "@javelin/ecs";
import geckos, { ClientChannel, RawMessage } from '@geckos.io/client'
import firebase from 'firebase'
import 'firebase/auth'

interface Client {
  socket: WebSocket,
  channel: ClientChannel,
}

//const HOSTNAME = '127.0.0.1'
const HOSTNAME = 'outer.space.buns.run'
//const HOSTNAME = '34.138.46.44'

export default createEffect(world => {
    let client: Client
	const messages = Array<ArrayBuffer>()

    firebase.auth().onAuthStateChanged(async user => {
		if (user) {
			const token: string = await user.getIdToken(true)
			const socket = new WebSocket(`wss://${HOSTNAME}:8001/connect?authorization=${token}`)
			socket.binaryType = 'arraybuffer'
			socket.onopen = (ev: Event) => {
				const channel = geckos({
					url: `https://${HOSTNAME}`,
					port: 8001,
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