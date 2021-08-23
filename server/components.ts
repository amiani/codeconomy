//@ts-nocheck
import {
  boolean,
  number,
  string,
  registerSchema,
  arrayOf,
} from "@javelin/ecs"
import type { Schema } from "@javelin/core"

export const Player: Schema = {
  initialized: boolean,
  uid: { ...string, length: 36 },
  name: { ...string, length: 16 },
  spawners: arrayOf(number)
}

export const Transform: Schema = {
  x: number,
  y: number,
  rotation: number,
}

export const Interpolate: Schema = {
  start: {
    x: number,
    y: number,
    rotation: number,
    time: number,
  },
  end: {
    x: number,
    y: number,
    rotation: number,
    time: number,
  },
  adaptiveSendRate: number,
}

export const Body: Schema = {
  handle: number
}

export const Script: Schema = {}

export const Context: Schema = {}

export const Isolate: Schema = {
  isDisposed: boolean,
  referenceCount: number,
}

export const Allegiance: Schema = {
  player: number,
  team: number
}

export const Health: Schema = {
  current: number,
  max: number,
}

export const Sprite: Schema = {
  x: number,
  y: number,
  rotation: number,
  visible: boolean
}

export const SpriteData: Schema = {
  name: { ...string, length: 32 }
}

export const Action: Schema = {
  throttle: number,
  rotate: number,
  fire: boolean
}

export const Countdown: Schema = {
  current: number,
  max: number,
}

export const Weapon: Schema = {
  damage: number,
  maxCooldown: number,
  currentCooldown: number,
}

const Vec = { x: number, y: number }
export const Bullet: Schema = {
  velocity: Vec,
  lifetime: number,
  damage: number
}

export const Spawner: Schema = {
  countdown: Countdown,
  owner: number
}

export const CombatHistory: Schema = {
  lastHitByPlayer: number
}

export const HuntScore: Schema = {
  points: number
}

export const GameData: Schema = {
  tick: number
}

export const Log: Schema = {
  logs: arrayOf({ ...string, length: 128 })
}

export const Bot: Schema = {
  name: { ...string, length: 5 },
}

registerSchema(Player, 1)
registerSchema(Transform, 2)
registerSchema(Body, 3)
registerSchema(Script, 4)
registerSchema(Allegiance, 5)
registerSchema(Health, 6)
registerSchema(Sprite, 7)
registerSchema(SpriteData, 8)
registerSchema(Context, 9)
registerSchema(Action, 10)
registerSchema(Weapon, 11)
registerSchema(Bullet, 12)
registerSchema(Spawner, 13)
registerSchema(HuntScore, 15)
registerSchema(CombatHistory, 16)
registerSchema(GameData, 17)
registerSchema(Log, 18)
registerSchema(Bot, 19)