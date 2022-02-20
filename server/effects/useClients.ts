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
import { playerTopic, moduleTopic } from '../topics'
import { MAX_PLAYERS, MESSAGE_MAX_BYTE_LENGTH } from '../env'
import { Header } from '../../common/types'

interface Pipe {
  channel: ServerChannel;
  producer: MessageProducer;
}

interface Client {
  uid: string;
  entity: Entity;
  socket: WebSocket;
  socketProducer: MessageProducer;
  pipe?: Pipe;
  initialized: boolean;
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
    //TODO: rename moduleTopic and moduleSystem
    moduleTopic.push({
      uid: client.uid,
      code: data.toString()
    })
  )

export default createEffect((world: World<Clock>) => {
  const clients = new Map<string, Client>()

  const wss = new WebSocketServer({
    server,
    path: '/connect'
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  wss.on("connection", async (socket: WebSocket, req: IncomingMessage) => {
    if (clients.size >= MAX_PLAYERS) {
      socket.close(503, "Server is full")
      return
    }
    

    const authorization = getAuthorization(req)
    if (!authorization) return
    try {
      const decodedToken = await admin.auth().verifyIdToken(authorization)
      const uid = decodedToken.uid
      const socketProducer = createMessageProducer({
        //maxByteLength: MESSAGE_MAX_BYTE_LENGTH
        maxByteLength: Infinity
      })
      if (clients.has(uid)) {
        removePlayer(uid)
      }
      clients.set(uid, {
        uid,
        socket,
        socketProducer,
        entity: createPlayer(world, uid),
        initialized: false
      })
    } catch (err: unknown) {
      console.error(err)
      socket.close()
    }
  })

  io.onConnection(channel => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const uid = channel.userData.uid as string
    const client = clients.get(uid)
    if (!client) {
      return
    }
    client.pipe = {
      channel,
      producer: createMessageProducer({
        maxByteLength: MESSAGE_MAX_BYTE_LENGTH
      })
    }
    client.initialized = true
    registerClient(client)

    channel.onDisconnect(() => {
      console.log('disconnect')
      removePlayer(uid)
    })
  })

  const removePlayer = (uid: string) => {
    const client = clients.get(uid)
    if (!client) {
      return
    }
    playerTopic.push({ type: 'player-left', entity: client.entity })
    world.destroy(client.entity)
    clients.delete(uid)
  }
    

  const sendUnreliable = (uid: string, header: Header, data: ArrayBuffer) => {
    const client = clients.get(uid)
    if (!client || !client.pipe) {
      return
    }
    const packet = writeHeader(header, data)
    client.pipe.channel.raw.emit(packet)

    const privateMessage = client.pipe.producer.take()
    if (privateMessage && privateMessage.byteLength > 0) {
      //const privatePacket = writeHeader(header, encode(privateMessage))
      //client.channel.raw.emit(privatePacket)
    }
  }
  const sendReliable = (
    uid: string,
    header: Header,
    data: ArrayBuffer,
    cb?: (err?: Error) => void
  ) => {
    const client = clients.get(uid)
    if (!client || !client.initialized) {
      return
    }
    const packet = writeHeader(header, data)
    client.socket.send(packet, cb)

    const privateMessage = client.socketProducer.take()
    if (privateMessage && privateMessage.byteLength > 0) {
      //const privatePacket = writeHeader(header, encode(privateMessage))
      //client.socket.send(privatePacket)
    }
  }
  const getPlayer = (uid: string) => clients.get(uid)?.entity
  const getAttachProducer = (uid: string) => clients.get(uid)?.socketProducer
  const getUpdateProducer = (uid: string) => clients.get(uid)?.pipe?.producer

  return () => ({
    sendUnreliable,
    sendReliable,
    getPlayer,
    getAttachProducer,
    getUpdateProducer,
  })
}, { shared: true })



function writeHeader(header: Header, message: ArrayBuffer): ArrayBuffer {
  const packet = new Uint8Array(message.byteLength + 5)
  const view = new DataView(packet.buffer)
  view.setUint32(0, header.tick)
  view.setUint8(4, header.type)
  packet.set(new Uint8Array(message), 5)
  return packet.buffer
}