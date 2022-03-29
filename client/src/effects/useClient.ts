import { createEffect, Entity } from "@javelin/ecs";
import geckos, { ClientChannel, RawMessage } from '@geckos.io/client'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import { MessageType, Packet } from '../../../common/types'

interface Client {
  socket: WebSocket,
  channel: ClientChannel,
}

const ws = import.meta.env.PROD ? `wss` : `ws`
const http = import.meta.env.PROD ? `https` : `http`
const HOSTNAME = import.meta.env.PROD ? 'outer.space.buns.run' : '127.0.0.1'

function readHeader(data: ArrayBuffer): Packet {
	const view = new DataView(data)
	const header = {
		tick: view.getUint32(0),
		type: view.getUint8(4)
	}
	return { header, message: data.slice(5) }
}

const decoder = new TextDecoder()
function handleInfoMessage(packet: Packet) {
	const message = decoder.decode(packet.message)
	console.log(message)
}

const useClient = createEffect(world => {
	let uid: string
	let playerEntity: Entity
	let client: Client

	const attachPackets = Array<Packet>()
	const updatePackets = Array<Packet>()
	let initPacket: Packet

	const auth = getAuth()
	onAuthStateChanged(auth, async user => {
		if (!user) {
			return
		}
		uid = user.uid
		const token: string = await user.getIdToken(true)
		const socket = new WebSocket(`${ws}://${HOSTNAME}:8001/connect?authorization=${token}`)
		socket.binaryType = 'arraybuffer'
		socket.onopen = (ev: Event) => {
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
			if (!(data instanceof ArrayBuffer)) {
				return
			}
			const packet = readHeader(data)
			switch (packet.header.type) {
				case MessageType.Init:
					initPacket = packet
					break
				case MessageType.Attach:
					attachPackets.push(packet)
					break
				case MessageType.Info:
					handleInfoMessage(packet)
					break
			}
		}
	})
	
	const getInitPacket = () => initPacket
	const setPlayerEntity = (entity: Entity) => playerEntity = entity

	return () => ({
		playerEntity,
		uid,
		client,
		attachPackets,
		updatePackets,
		setPlayerEntity,
		getInitPacket,
	})
}, { shared: true })

export default useClient