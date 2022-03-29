import WebSocket, { WebSocketServer } from 'ws'
import url from 'url'
import { createEffect, Entity, toComponent, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import admin from 'firebase-admin'
import { ServerChannel } from '@geckos.io/server'
import { IncomingMessage } from 'http'
import { createMessageProducer, MessageProducer } from '@javelin/net'

import server from '../../server'
import { createPlayer } from '../../factories'
import io from "../../geckosServer"
import { playerTopic, scriptTopic } from '../../topics'
import { MAX_PLAYERS, MESSAGE_MAX_BYTE_LENGTH } from '../../env'
import { ClientSchema, ClientComponent } from '../../components'
import { sendUnreliably, sendReliably } from './send'

interface Client {
  uid: string;
  entity: Entity;
  isInitialized: boolean;
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

const notifyScriptTopic = (client: ClientComponent) =>
  (client as Client).socket.on("message", (data: WebSocket.Data) =>
    scriptTopic.push({
      uid: client.uid,
      code: data.toString()
    })
  )

const createClient = (
  uid: string,
  entity: Entity,
  socket: WebSocket,
  channel: ServerChannel
): ClientComponent => {
	const client: Client = {
    uid,
    entity,
    isInitialized: false,
    socket,
    socketProducer: createMessageProducer({
      //maxByteLength: MESSAGE_MAX_BYTE_LENGTH
      maxByteLength: Infinity

    }),
    channel,
    channelProducer: createMessageProducer({
      maxByteLength: MESSAGE_MAX_BYTE_LENGTH
    })
  }
  return toComponent(client, ClientSchema)
}

const useClients = createEffect((world: World<Clock>) => {
  const sockets = new Map<string, WebSocket>()
  const clients = new Map<string, ClientComponent>()

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
    const client: ClientComponent = createClient(uid, entity, socket, channel)
    world.attachImmediate(entity, [client])
    notifyScriptTopic(client)

    channel.onDisconnect(() => {
      console.log('disconnect')
      removePlayer(uid)
    })
  })

  const getPlayer = (uid: string) => clients.get(uid)?.entity
  /*
  const getAttachProducer = (uid: string) => clients.get(uid)?.socketProducer
  const getUpdateProducer = (uid: string) => clients.get(uid)?.channelProducer
  */

  return () => ({
    sendUnreliably,
    sendReliably,
    getPlayer,
    /*
    getAttachProducer,
    getUpdateProducer,
    */
  })
}, { shared: true })

export default useClients
export type { Client }
