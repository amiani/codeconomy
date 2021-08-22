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
import { MAX_PLAYERS } from '../env'

export default createEffect((world: World<Clock>) => {
  const clients = new Map()

  const wss = new WebSocket.Server({
    server,
    path: '/connect'
  })
  wss.on("connection", async (socket, req) => {
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
          clients.set(uid, { uid, socket })
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
      client.player = player
      registerClient(client)

      channel.onDisconnect(() => {
        playerTopic.push({ type: 'player-left', entity: player })
        world.destroy(player)
        clients.delete(player)
      })
    })
  })

  const sendUpdate = (uid: string, data: ArrayBuffer) =>
    clients.get(uid).channel.raw.emit(data)
  const getPlayer = (uid: string) => clients.get(uid).player

  return function useClients() {
    return {
      sendUpdate,
      getPlayer
    }
  }
}, { shared: true })

interface Client {
  uid: string,
  socket: WebSocket,
  channel: any,
  player: Entity
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