import { boolean, number, string, registerSchema } from "@javelin/ecs"

export const Player = {
  clientId: number,
  initialized: boolean,
}

export const Transform = {
  x: number,
  y: number,
  rotation: number,
}

export const Body = {
  handle: number
}

export const Script = {}

export const Context = {}

export const Team = {
  id: number
}

export const Health = {
  current: number,
  max: number,
}

export const Sprite = {
  x: number,
  y: number,
  rotation: number
}

export const SpriteData = {
  name: { ...string, length: 64 }
}

export const Action = {
  throttle: number,
  rotate: number,
  fire: boolean
}

registerSchema(Player, 1)
registerSchema(Transform, 2)
registerSchema(Body, 3)
registerSchema(Script, 4)
registerSchema(Team, 5)
registerSchema(Health, 6)
registerSchema(Sprite, 7)
registerSchema(SpriteData, 8)
registerSchema(Context, 9)
registerSchema(Action, 10)