import { World, createQuery } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import { Body, Script, Team } from '../components'
import useIsolates from '../isolates'


const scriptsBodyTeam = createQuery(Script, Body, Team)

const createState = (body: typeof rapier.RigidBody) => ({
	position: body.translation(),
	rotation: body.rotation(),
})

export default function scriptSystem(world: World) {
	const { isolates, contexts } = useIsolates()
	scriptsBodyTeam((e, [script, bodyComp, team]) => {
		const body = bodyComp as typeof rapier.Body
		const context = contexts[team.id]
		const state = createState(body)
		context.global.setSync('state', state, { copy: true })
		const action = (<ivm.Script>script).runSync(context, { copy: true })
		//body.applyForce({ x: action.throttle, y: 0 }, true)
		body.applyTorque(action.rotate, true)
	})
}