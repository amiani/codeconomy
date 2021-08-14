import { component, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from "isolated-vm"
import { Player, Isolate } from "../components"
import createSpawner from "./createSpawner"

export default function createPlayer(world: World<Clock>, uid: string) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
    const player = world.create(toComponent(isolate, Isolate))
    const spawner = createSpawner(world, -100, 0, 0, player, 10)
    world.attach(player, component(Player, {
      uid,
      spawners: [spawner]
    }))
	return player
}