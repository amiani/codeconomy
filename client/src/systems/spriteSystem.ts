import {
  ComponentOf,
  createQuery,
  toComponent,
  useMonitor,
  World
} from '@javelin/ecs'
import * as PIXI from 'pixi.js'

import { Interpolate, Sprite, SpriteData, Team, Transform } from '../../../server/components'
import app from '../pixiApp'
import useViewport from '../useViewport'

const interpolatedSprites = createQuery(Transform, Interpolate, Sprite)
const transformSprites = createQuery(Transform, Sprite)
const sprites = createQuery(Sprite)
const spriteDatas = createQuery(SpriteData)
const transformSpriteDatas = createQuery(Transform, SpriteData, Team)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const copyInterpolateToSprite = (
  interpolate: ComponentOf<typeof Interpolate>,
  sprite: ComponentOf<typeof Sprite>
) => {
  const { start, end } = interpolate
  const t = (performance.now() - 100 - start.time) / (end.time - start.time)
  sprite.x = lerp(start.x, end.x, t)
  sprite.y = -lerp(start.y, end.y, t)
  sprite.rotation = -lerp(start.rotation, end.rotation, t)
}

export default function spriteSystem(world: World) {
  const viewport = useViewport()
  useMonitor(
    transformSpriteDatas,
    (e, [transform, data, team]) => {
      const sprite = viewport.addChild(
        new PIXI.Sprite(app.loader.resources[data.name].texture))
      sprite.scale.x = 1/32
      sprite.scale.y = 1/32
      sprite.anchor.x = 0.5
      sprite.anchor.y = 0.5
      sprite.pivot.x = 0.5
      sprite.pivot.y = 0.5
      sprite.x = transform.x * 32
      sprite.y = -transform.y * 32
      sprite.rotation = -transform.rotation
      if (team.id == 0) {
        sprite.tint = 0xff9999
      } else {
        sprite.tint = 0x99ff99
      }
      world.attachImmediate(e, [toComponent(sprite, Sprite)])
    },
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