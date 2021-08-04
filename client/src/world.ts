import {
  createEffect,
  createQuery,
  createWorld,
  useMonitor,
  toComponent,
} from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"
import { Client } from "@web-udp/client"
import * as PIXI from "pixi.js"
import { Transform, Body, Sprite } from "../../server/components"
import { viewport, app } from "./pixiApp"

export const transforms = createQuery(Transform)
export const bodies = createQuery(Transform, Body)
const transformsSprite = createQuery(Transform, Sprite)

export const useNet = createEffect(
  world => {
    const state = { bytes: 0 }
    const client = new Client({
      url: `${window.location.hostname}:8000`,
    })
    const handler = createMessageHandler(world)

    client.connect().then(c =>
      c.messages.subscribe(message => {
        state.bytes += message.byteLength
        handler.push(message)
      }),
    )

    return () => {
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)

export const world = createWorld()

world.addSystem(world => {
  const net = useNet()
})

world.addSystem(world => {
  useMonitor(
    transforms,
    (e, [transform]) => {
      const sprite = viewport.addChild(new PIXI.Sprite(app.loader.resources.ship.texture))
      sprite.x = transform.x * 32
      sprite.y = transform.y * 32
      sprite.anchor.x = 0.5
      sprite.anchor.y = 0.5
      world.attachImmediate(e, [toComponent(sprite, Sprite)])
    },
    (e, [transform]) => {}
  )

  transformsSprite((e, [transform, sprite]) => {
    sprite.x = transform.x * 32
    sprite.y = transform.y * 32
  })
})