import { World, createQuery, toComponent, component } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import { Body, Script, Context, Action } from '../components'

const scriptsContextBodyAction = createQuery(Script, Context, Body, Action)

const createState = (body: typeof rapier.RigidBody) => ({
	position: body.translation(),
	rotation: body.rotation(),
})

export default function scriptSystem(world: World) {
	scriptsContextBodyAction(async (e, [script, contextComp, bodyComp, action]) => {
		const body = bodyComp as typeof rapier.Body
		const context = contextComp as ivm.Context
		const state = createState(body)
		await context.global.set('state', state, { copy: true })
		const a = await (<ivm.Script>script).run(context, { copy: true })
		action.throttle = a.throttle
		action.rotate = a.rotate
		action.fire = a.fire
	})
}