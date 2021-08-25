import WebSocket from 'ws'
import url from 'url'
import { createEffect, Entity, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import * as admin from 'firebase-admin'
//@ts-ignore
import { server } from '../server'

import { createPlayer } from '../factories'
//@ts-ignore
import { getServer } from "../geckosServer"
import { playerTopic, scriptTopic } from '../topics'
import { MAX_PLAYERS, MESSAGE_MAX_BYTE_LENGTH } from '../env'
import { createMessageProducer, encode, MessageProducer } from '@javelin/net'
import { Header } from '../../common/types'

export default createEffect((world: World<Clock>) => {
  const clients = new Map()

  const wss = new WebSocket.Server({
    server,
    path: '/connect'
  })
  wss.on("connection", async (socket: WebSocket, req) => {
    if (clients.size >= MAX_PLAYERS) {
      socket.close(503, "Server is full")
      return
    }
    

    try {
      if (req.url) {
        const queryObject = url.parse(req.url,true).query;
        if (queryObject.authorization) {
          const decodedToken = await admin.auth().verifyIdToken(queryObject.authorization as string)
          const uid = decodedToken.uid
          const socketProducer = createMessageProducer({
            maxByteLength: MESSAGE_MAX_BYTE_LENGTH
          })
          clients.set(uid,{
            uid,
            socket,
            socketProducer,
            initialized: false
          })
        }
      }
    } catch (err: any) {
      console.error(err)
      socket.close()
    }
  })
  getServer.then((io: any) => {
    io.onConnection((channel: any) => {
      const { uid } = channel.userData
      const player = createPlayer(world, uid)
      const client = clients.get(uid)
      client.channel = channel
      client.channelProducer = createMessageProducer({
        maxByteLength: MESSAGE_MAX_BYTE_LENGTH
      })
      client.player = player
      client.initialized = true
      registerClient(client)

      channel.onDisconnect(() => {
        //console.log('disconnect')
        playerTopic.push({ type: 'player-left', entity: player })
        world.destroy(player)
        clients.delete(player)
      })
    })
  })

  const sendUnreliable = (uid: string, header: Header, data: ArrayBuffer) => {
    const client = clients.get(uid) as Client
    if (client && client.initialized) {
      const packet = writeHeader(header, data)
      client.channel.raw.emit(packet)

      const privateMessage = client.channelProducer.take()
      if (privateMessage && privateMessage.byteLength > 0) {
        const privatePacket = writeHeader(header, encode(privateMessage))
        client.channel.raw.emit(privatePacket)
      }
    }
  }
  const sendReliable = (
    uid: string,
    header: Header,
    data: ArrayBuffer,
    cb?: (err?: Error) => void
  ) => {
    const client = clients.get(uid) as Client
    if (client && client.initialized) {
      const packet = writeHeader(header, data)
      client.socket.send(packet, cb)

      const privateMessage = client.socketProducer.take()
      if (privateMessage && privateMessage.byteLength > 0) {
        const privatePacket = writeHeader(header, encode(privateMessage))
        client.socket.send(privatePacket)
      }
    }
  }
  const getPlayer = (uid: string) => clients.get(uid).player
  const getAttachProducer = (uid: string) => clients.get(uid).socketProducer
  const getUpdateProducer = (uid: string) => clients.get(uid).channelProducer

  return function useClients() {
    return {
      sendUnreliable,
      sendReliable,
      getPlayer,
      getAttachProducer,
      getUpdateProducer,
    }
  }
}, { shared: true })

interface Client {
  uid: string;
  socket: WebSocket;
  socketProducer: MessageProducer;
  channel: any;
  channelProducer: MessageProducer;
  player: Entity;
  initialized: boolean;
}

const registerClient = (client: Client) => {
  client.socket.on("message", async (data: WebSocket.Data) => {
    //console.log(typeof data.toString())
    scriptTopic.push({
      uid: client.uid,
      code: data.toString()
    })
  })
}

function writeHeader(header: Header, message: ArrayBuffer): ArrayBuffer {
  const packet = new Uint8Array(message.byteLength + 4)
  const view = new DataView(packet.buffer)
  view.setUint32(0, header.tick)
  packet.set(new Uint8Array(message), 4)
  return packet.buffer
}