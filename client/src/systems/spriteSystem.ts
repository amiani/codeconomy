import {
  ComponentOf,
  createQuery,
  toComponent,
  useMonitor,
  World
} from '@javelin/ecs'
import * as PIXI from 'pixi.js'

import { Interpolate, Sprite, SpriteData, Team, Transform } from '../../../server/components'
import { app, viewport } from '../pixiApp'

const interpolatedSprites = createQuery(Transform, Interpolate, Sprite)
const transformSprites = createQuery(Transform, Sprite)
const sprites = createQuery(Sprite)
const spriteDatas = createQuery(SpriteData)
const transformSpriteDatas = createQuery(Transform, SpriteData, Team)

const copyInterpolateToSprite = (
  interpolate: ComponentOf<typeof Interpolate>,
  sprite: ComponentOf<typeof Sprite>
) => {
  sprite.x = interpolate.x * 32
  sprite.y = interpolate.y * 32
  sprite.rotation = interpolate.rotation
  sprite.visible = !!interpolate.lastUpdateTime
}

export default function spriteSystem(world: World) {
  useMonitor(
    transformSpriteDatas,
    (e, [transform, data, team]) => {
      const sprite = viewport.addChild(
        new PIXI.Sprite(app.loader.resources[data.name].texture))
      sprite.anchor.x = 0.5
      sprite.anchor.y = 0.5
      sprite.x = transform.x * 32
      sprite.y = transform.y * 32
      sprite.rotation = transform.rotation
      if (team.id == 0) {
        sprite.tint = 0xff9999
      } else {
        sprite.tint = 0x99ff99
      }
      world.attachImmediate(e, [toComponent(sprite, Sprite)])
    },
    (e, [data]) => {}
  )

  useMonitor(
    sprites,
    (e, [sprite]) => {},
    (e, [sprite]) => viewport.removeChild(sprite as PIXI.Sprite)
  )

  interpolatedSprites((e, [transform, interpolate, sprite]) => {
    copyInterpolateToSprite(interpolate, sprite)
  })
}