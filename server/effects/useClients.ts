import WebSocket, { WebSocketServer } from 'ws'
import url from 'url'
import { createEffect, Entity, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import admin from 'firebase-admin'
import { ServerChannel } from '@geckos.io/server'
import { IncomingMessage } from 'http'
import { createMessageProducer, MessageProducer } from '@javelin/net'

import server from '../server'
import { createPlayer } from '../factories'
import io from "../geckosServer"
import { playerTopic, scriptTopic } from '../topics'
import { MAX_PLAYERS, MESSAGE_MAX_BYTE_LENGTH } from '../env'
import { Header } from '../../common/types'

interface Client {
  uid: string;
  entity: Entity;
  socket: WebSocket;
  socketProducer: MessageProducer;
  channel: ServerChannel;
  channelProducer: MessageProducer;
}

const isString = (value: unknown): value is string => typeof value === 'string'

const getAuthorization = (req: IncomingMessage): string | undefined => {
  if (!req.url) {
    return
  }

  const auth = url.parse(req.url, true).query?.authorization
  if (!isString(auth)) {
    console.error(`useClients got invalid auth query string. Got `, auth)
    return
  }
  return auth
}

const registerClient = (client: Client) =>
  client.socket.on("message", (data: WebSocket.Data) =>
    scriptTopic.push({
      uid: client.uid,
      code: data.toString()
    })
  )

const createClient = (uid: string, entity: number, socket: WebSocket, channel: ServerChannel): Client => ({
  uid,
  entity,
  socket,
  socketProducer: createMessageProducer({
    //maxByteLength: MESSAGE_MAX_BYTE_LENGTH
    maxByteLength: Infinity

  }),
  channel,
  channelProducer: createMessageProducer({
    maxByteLength: MESSAGE_MAX_BYTE_LENGTH
  })
})

function writeHeader(header: Header, message: ArrayBuffer): ArrayBuffer {
  const packet = new Uint8Array(message.byteLength + 5)
  const view = new DataView(packet.buffer)
  view.setUint32(0, header.tick)
  view.setUint8(4, header.type)
  packet.set(new Uint8Array(message), 5)
  return packet.buffer
}

export default createEffect((world: World<Clock>) => {
  const sockets = new Map<string, WebSocket>()
  const clients = new Map<string, Client>()

  const wss = new WebSocketServer({
    server,
    path: '/connect'
  })

  const removePlayer = (uid: string) => {
    const client = clients.get(uid)
    if (!client) {
      return
    }
    playerTopic.push({ type: 'player-left', entity: client.entity })
    world.destroy(client.entity)
    clients.delete(uid)
    sockets.delete(uid)
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  wss.on("connection", async (socket: WebSocket, req: IncomingMessage) => {
    if (clients.size >= MAX_PLAYERS) {
      socket.close(503, "Server is full")
      return
    }

    const authorization = getAuthorization(req)
    if (!authorization) return
    try {
      const { uid } = await admin.auth().verifyIdToken(authorization)
      removePlayer(uid)
      sockets.set(uid, socket)
    } catch (err: unknown) {
      console.error(err)
      socket.close()
    }
  })

  //sets up the client with player entity
  io.onConnection(channel => {
    const { uid } = channel.userData as { uid: string }
    const socket = sockets.get(uid)
    if (!socket) {
      void channel.close()
      return
    }
    const entity = createPlayer(world, uid)
    const client: Client = createClient(uid, entity, socket, channel)
    registerClient(client)

    channel.onDisconnect(() => {
      console.log('disconnect')
      removePlayer(uid)
    })
  })

  const sendUnreliable = (uid: string, header: Header, data: ArrayBuffer) => {
    const client = clients.get(uid)
    if (!client) {
      return
    }
    const packet = writeHeader(header, data)
    client.channel.raw.emit(packet)

    /*
    const privateMessage = client.channelProducer.take()
    if (privateMessage && privateMessage.byteLength > 0) {
      const privatePacket = writeHeader(header, encode(privateMessage))
      client.channel.raw.emit(privatePacket)
    }
    */
  }

  const sendReliable = (
    uid: string,
    header: Header,
    data: ArrayBuffer,
    cb?: (err?: Error) => void
  ) => {
    const client = clients.get(uid)
    if (!client) {
      return
    }
    const packet = writeHeader(header, data)
    client.socket.send(packet, cb)

    /*
    const privateMessage = client.socketProducer.take()
    if (privateMessage && privateMessage.byteLength > 0) {
      const privatePacket = writeHeader(header, encode(privateMessage))
      client.socket.send(privatePacket)
    }
    */
  }
  const getPlayer = (uid: string) => clients.get(uid)?.entity
  const getAttachProducer = (uid: string) => clients.get(uid)?.socketProducer
  const getUpdateProducer = (uid: string) => clients.get(uid)?.channelProducer

  return () => ({
    sendUnreliable,
    sendReliable,
    getPlayer,
    getAttachProducer,
    getUpdateProducer,
  })
}, { shared: true })


