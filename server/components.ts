import {
  boolean,
  number,
  string,
  registerSchema,
  arrayOf,
  ComponentOf,
} from "@javelin/ecs"

export const Player = {
  initialized: boolean,
  uid: { ...string, length: 36 },
  name: { ...string, length: 16 },
}

export const Transform = {
  x: number,
  y: number,
  rotation: number,
}

export const Interpolate = {
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

export const Body = {
  handle: number
}

export const Module = {}

export const Context = {}

export const Isolate = {
  isDisposed: boolean,
  referenceCount: number,
}

export const Allegiance = {
  player: number,
  team: number
}

export const Health = {
  current: number,
  max: number,
}

export const Sprite = {
  x: number,
  y: number,
  rotation: number,
  visible: boolean
}

export const SpriteData = {
  name: { ...string, length: 32 }
}

export const Command = {
  throttle: number,
  yaw: number,
  fire: boolean
}

export const Countdown = {
  current: number,
  max: number,
}

export const Weapon = {
  damage: number,
  maxCooldown: number,
  currentCooldown: number,
}

const Vec = { x: number, y: number }
export const Bullet = {
  velocity: Vec,
  lifetime: number,
  damage: number
}

export const Spawner = {
  countdown: Countdown,
  owner: number,
}

export const CombatHistory = {
  lastHitByPlayer: number
}

export const HuntScore = {
  points: number
}

export const Log = {
  logs: arrayOf({ ...string, length: 128 })
}

export const Bot = {
  name: { ...string, length: 5 },
}

export const Code = {
  code: string
}

export const GamePhase = {
  phase: number,
}

export const ClientSchema = {
  uid: string,
  entity: number,
  isInitialized: boolean,
}
export type ClientComponent = ComponentOf<typeof ClientSchema>

registerSchema(Player, 1)
registerSchema(Transform, 2)
registerSchema(Body, 3)
registerSchema(Module, 4)
registerSchema(Allegiance, 5)
registerSchema(Health, 6)
registerSchema(Sprite, 7)
registerSchema(SpriteData, 8)
registerSchema(Context, 9)
registerSchema(Command, 10)
registerSchema(Weapon, 11)
registerSchema(Bullet, 12)
registerSchema(Spawner, 13)
registerSchema(HuntScore, 15)
registerSchema(CombatHistory, 16)
registerSchema(Log, 18)
registerSchema(Bot, 19)
registerSchema(Code, 20)
registerSchema(GamePhase, 21)
registerSchema(ClientSchema, 22)