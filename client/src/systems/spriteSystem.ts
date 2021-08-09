import {
  ComponentOf,
  createQuery,
  toComponent,
  useMonitor,
  World
} from '@javelin/ecs'
import * as PIXI from 'pixi.js'

import { Interpolate, Sprite, SpriteData, Transform } from '../../../server/components'
import { app, viewport } from '../pixiApp'

const interpolatedSprites = createQuery(Interpolate, Sprite)
const transformSprites = createQuery(Transform, Sprite)
const sprites = createQuery(Sprite)
const spriteDatas = createQuery(SpriteData)

const copyInterpolateToSprite = (
  interpolate: ComponentOf<typeof Interpolate>,
  sprite: ComponentOf<typeof Sprite>
) => {
  sprite.x = interpolate.x * 32
  sprite.y = interpolate.y * 32
  sprite.rotation = interpolate.rotation
}

export default function spriteSystem(world: World) {
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

  useMonitor(
    sprites,
    (e, [sprite]) => {},
    (e, [sprite]) => viewport.removeChild(sprite as PIXI.Sprite)
  )

  interpolatedSprites((e, [interpolate, sprite]) => {
    copyInterpolateToSprite(interpolate, sprite)
  })
}