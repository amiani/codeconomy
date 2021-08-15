import WebSocket from 'ws'
import url from 'url'
import { createEffect, Entity, World } from '@javelin/ecs'
import { Clock } from '@javelin/hrtime-loop'
import * as admin from 'firebase-admin'

import { createPlayer } from '../factories'
import { Player } from '../components'
//@ts-ignore
import { getServer } from "../geckosServer"

const authenticate = async (key: string) => {
	try {
		const decodedToken = await admin.auth().verifyIdToken(key)
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}

export default createEffect((world: World<Clock>) => {
  const clients = new Map()

  const wss = new WebSocket.Server({
    port: 8001,
    path: '/connect'
  })
  wss.on("connection", async (socket, req) => {
    try {
      if (req.url) {
        const queryObject = url.parse(req.url,true).query;
        if (queryObject.authorization) {
          const decodedToken = await admin.auth().verifyIdToken(queryObject.authorization as string)
          const uid = decodedToken.uid
          clients.set(uid, { uid, socket })
          //registerClient(client)
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
        world.destroy(player)
        const playerComp = world.tryGet(player, Player)
        if (playerComp) {
          playerComp.spawners.forEach((spawner) => {
            world.destroy(spawner)
          })
        }
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
  client.socket.on("message", async (data) => {
    console.log(`got message: ${data}`)
  })
}