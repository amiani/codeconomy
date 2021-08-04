import {
  createQuery,
  createWorld,
  useMonitor,
  toComponent,
  ComponentOf
} from "@javelin/ecs"
import * as PIXI from "pixi.js"

import clientSystem from './systems/clientSystem'
import { Transform, Sprite, SpriteData } from "../../server/components"
import { viewport, app } from "./pixiApp"

const transformsSprite = createQuery(Transform, Sprite)
const spriteDatas = createQuery(SpriteData)

const world = createWorld()

world.addSystem(clientSystem)

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