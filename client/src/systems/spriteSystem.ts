import { ComponentOf, createQuery, toComponent, useMonitor, World } from '@javelin/ecs'
import * as PIXI from 'pixi.js'

import { Sprite, SpriteData, Transform } from '../../../server/components'
import { app, viewport } from '../pixiApp'

const transformsSprite = createQuery(Transform, Sprite)
const spriteDatas = createQuery(SpriteData)

const copyTransformToSprite = (
  transform: ComponentOf<typeof Transform>,
  sprite: ComponentOf<typeof Sprite>
) => {
  sprite.x = transform.x * 32
  sprite.y = transform.y * 32
  sprite.rotation = transform.rotation
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

  transformsSprite((e, [transform, sprite]) => {
    copyTransformToSprite(transform, sprite)
  })
}