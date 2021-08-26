import {
  ComponentOf,
  createQuery,
  toComponent,
  useMonitor,
  World
} from '@javelin/ecs'
import * as PIXI from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'

import { Interpolate, Sprite, SpriteData, Allegiance, Transform, Bullet } from '../../../server/components'
import app from '../pixiApp'
import { useViewport } from '../effects'
import { teamColors } from '../ui/colors'

const interpolatedSprites = createQuery(Transform, Interpolate, Sprite).not(Bullet)
const sprites = createQuery(Sprite)
const transformSpriteDatas = createQuery(Transform, SpriteData, Allegiance)
const bulletQuery = createQuery(Bullet, Sprite)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function copyInterpolateToSprite(
  interpolate: ComponentOf<typeof Interpolate>,
  sprite: ComponentOf<typeof Sprite>
) {
  const { start, end } = interpolate
  const t = (performance.now() - 50 - start.time) / (end.time - start.time)
  sprite.x = lerp(start.x, end.x, t)
  sprite.y = -lerp(start.y, end.y, t)
  sprite.rotation = -lerp(start.rotation, end.rotation, t)
}


export default function spriteSystem(world: World) {
  const { viewport } = useViewport()
  useMonitor(
    transformSpriteDatas,
    (e, [transform, data, allegiance]) => {
      const resource = app.loader.resources[data.name]
      if (resource) {
        const sprite = viewport.addChild(new PIXI.Sprite(resource.texture))
        sprite.scale.x = 1/32
        sprite.scale.y = 1/32
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5
        sprite.pivot.x = 0.5
        sprite.pivot.y = 0.5
        sprite.x = transform.x
        sprite.y = -transform.y
        sprite.rotation = -transform.rotation
        sprite.filters = [new GlowFilter({
          color: teamColors[allegiance.team],
          distance: 10,
          innerStrength: 1,
          outerStrength: 1
        })]
        world.attachImmediate(e, [toComponent(sprite, Sprite)])
      }
    },
  )

  useMonitor(
    sprites,
    (e, [sprite]) => {},
    (e, [sprite]) => viewport.removeChild(sprite as PIXI.Sprite)
  )

  interpolatedSprites((e, [transform, interpolate, sprite]) => {
    copyInterpolateToSprite(interpolate, sprite);
  })

  for (const [entities, [bullets, sprites]] of bulletQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      const sprite = sprites[i]
      const bullet = bullets[i]
      sprite.x += bullet.velocity.x * (1 / 60)
      sprite.y += -bullet.velocity.y * (1 / 60)
    }
  }
}