import { component, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from "isolated-vm"
import { Bot, Code, Isolate }  from "../components"
import { playerTopic } from "../topics"
import fs from 'fs'

const huntClosest = fs.readFileSync("./scripts/huntClosest.js", "utf-8")

export default function createBot(world: World<Clock>, name: string) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
	
    const bot = world.create(
		toComponent(isolate, Isolate),
		component(Code, { code: huntClosest }),
        component(Bot, { name })
	)
    world.attach(bot)
    playerTopic.push({ type: 'player-joined', entity: bot })
    return bot
}
