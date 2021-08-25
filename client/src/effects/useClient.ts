import { createEffect } from "@javelin/ecs";
import geckos, { ClientChannel, RawMessage } from '@geckos.io/client'
import firebase from 'firebase/app'
import 'firebase/auth'

import { Header, Packet } from '../../../common/types'

interface Client {
  socket: WebSocket,
  channel: ClientChannel,
}

const HOSTNAME = import.meta.env.PROD ? 'outer.space.buns.run' : '127.0.0.1'

export default createEffect(world => {
    let client: Client

	const attachPackets = Array<Packet>()
	const updatePackets = Array<Packet>()

    firebase.auth().onAuthStateChanged(async user => {
		if (user) {
			const token: string = await user.getIdToken(true)
			const ws = import.meta.env.PROD ? `wss` : `ws`
			const socket = new WebSocket(`${ws}://${HOSTNAME}:8001/connect?authorization=${token}`)
			socket.binaryType = 'arraybuffer'
			socket.onopen = (ev: Event) => {
				const http = import.meta.env.PROD ? `https` : `http`
				const channel = geckos({
					url: `${http}://${HOSTNAME}`,
					port: 8001,
					authorization: token
				})

				channel.onConnect(error => {
					if (error) {
						console.error(error.message)
						return
					}
					client = { socket, channel }

					channel.onRaw((data: RawMessage) => {
						if (data instanceof ArrayBuffer) {
							const packet = readHeader(data)
							updatePackets.push(packet)
						}
					})
					console.log('connected')
				})
			}
			socket.onmessage = ({ data }: MessageEvent) => {
				if (data instanceof ArrayBuffer) {
					const packet = readHeader(data)
					attachPackets.push(packet)
				}
			}
		}
    })

	return () => ({
		client,
		attachPackets,
		updatePackets
	})
}, { shared: true })

function readHeader(data: ArrayBuffer): Packet {
	const view = new DataView(data)
	const header = {
		tick: view.getUint32(0),
		type: view.getUint8(4)
	}
	return { header, message: data.slice(5) }
}