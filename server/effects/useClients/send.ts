import { Header } from '../../../common/types'
import { ClientComponent } from '../../components'
import { Client } from './useClients'

function writeHeader(header: Header, message: ArrayBuffer): ArrayBuffer {
  const packet = new Uint8Array(message.byteLength + 5)
  const view = new DataView(packet.buffer)
  view.setUint32(0, header.tick)
  view.setUint8(4, header.type)
  packet.set(new Uint8Array(message), 5)
  return packet.buffer
}

const sendUnreliably = (clientComp: ClientComponent, header: Header, data: ArrayBuffer) => {
	const packet = writeHeader(header, data);
	(clientComp as Client).channel.raw.emit(packet)

	/*
	const privateMessage = client.channelProducer.take()
	if (privateMessage && privateMessage.byteLength > 0) {
		const privatePacket = writeHeader(header, encode(privateMessage))
		client.channel.raw.emit(privatePacket)
	}
	*/
}

const sendReliably = (
	clientComp: ClientComponent,
	header: Header,
	data: ArrayBuffer,
	cb?: (err?: Error) => void
) => {
	const packet = writeHeader(header, data);
	(clientComp as Client).socket.send(packet, cb)

	/*
	const privateMessage = client.socketProducer.take()
	if (privateMessage && privateMessage.byteLength > 0) {
		const privatePacket = writeHeader(header, encode(privateMessage))
		client.socket.send(privatePacket)
	}
	*/
}

export { sendUnreliably, sendReliably }