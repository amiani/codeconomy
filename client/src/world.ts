import {
  Entity,
  component,
  createEffect,
  createQuery,
  createWorld,
  number,
  useInterval,
  useMonitor,
  useRef,
  toComponent,
} from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"
import { Client } from "@web-udp/client"
import * as PIXI from "pixi.js"
import { Transform, Body, Sprite } from "../../server/components"
import pixiApp from "./pixiApp"

const Camera = {
  x: number,
  y: number,
}
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
  useMonitor(
    transforms,
    (e, [transform]) => {
      const sprite = new PIXI.Sprite(pixiApp.loader.resources.ship.texture)
      sprite.x = transform.x
      sprite.y = transform.y
      sprite.anchor.x = 0.5
      sprite.anchor.y = 0.5
      pixiApp.stage.addChild(sprite)
      world.attachImmediate(e, [toComponent(sprite, Sprite)])
    },
    (e, [transform]) => {}
  )
})

world.addSystem(world => {
  const { create, attachImmediate, latestTickData: canvas } = world
  const net = useNet()
  const rate = useRef(0)
  const update = useInterval(1000)
  const cameraEntity = useRef<Entity | -1>(-1)

  if (update) {
    rate.value = net.bytes / 1000
    net.bytes = 0
  }

  if (cameraEntity.value === -1) {
    cameraEntity.value = create()
    attachImmediate(cameraEntity.value, [component(Camera)])
  }

  const camera = world.get(cameraEntity.value, Camera)
  //const offsetX = camera.x - canvas.width / 2
  //const offsetY = camera.y - canvas.height / 2

  transformsSprite((e, [transform, sprite]) => {
    sprite.x = transform.x
    sprite.y = transform.y
  })
})
