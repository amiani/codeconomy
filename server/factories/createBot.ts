import { component, toComponent, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import ivm from "isolated-vm"
import fs from 'fs'
import ts from 'typescript'

import { Bot, Code, Isolate }  from "../components"
import { playerTopic } from "../topics"

const compilerOptions: ts.CompilerOptions = {
    allowJs: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext
}
const huntClosestTS = fs.readFileSync("./scripts/huntClosest.js", "utf-8")
const huntClosest = ts.transpile(huntClosestTS, compilerOptions)

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
