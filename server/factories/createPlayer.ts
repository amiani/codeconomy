import { component, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from "isolated-vm"
import { Player, Isolate } from "../components"
import { playerTopic } from "../topics"

export default function createPlayer(world: World<Clock>, uid: string) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
    const player = world.create(toComponent(isolate, Isolate))
    world.attach(player, component(Player, { uid, name: uid }))
    playerTopic.push({ type: 'player-joined', entity: player })
    return player
}