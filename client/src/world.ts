import {
  createEffect,
  createQuery,
  createWorld,
  useMonitor,
  toComponent,
  ComponentOf
} from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"
import { Client } from "@web-udp/client"
import * as PIXI from "pixi.js"
import { Transform, Body, Sprite, SpriteData, Action } from "../../server/components"
import { viewport, app } from "./pixiApp"

export const transforms = createQuery(Transform)
const transformsSprite = createQuery(Transform, Sprite)
const spriteDatas = createQuery(SpriteData)

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

const copyTransformToSprite = (
  transform: ComponentOf<typeof Transform>,
  sprite: ComponentOf<typeof Sprite>
) => {
  sprite.x = transform.x * 32
  sprite.y = transform.y * 32
  sprite.rotation = transform.rotation
}

world.addSystem(world => {
  useMonitor(
    spriteDatas,
    (e, [data]) => {
      const sprite = viewport.addChild(
        new PIXI.Sprite(app.loader.resources[data.name].texture))
      sprite.anchor.x = 0.5
      sprite.anchor.y = 0.5
      world.attachImmediate(e, [toComponent(sprite, Sprite)])
    },
    (e, [data]) => {}
  )

  transformsSprite((e, [transform, sprite]) => {
    copyTransformToSprite(transform, sprite)
  })
})