import { World, createQuery, Entity } from "@javelin/ecs"
import ivm from "isolated-vm"
const rapier = require('@a-type/rapier2d-node')

import { Body, Script, Context, Action, Ship, Health, Team, Transform } from '../components'

const scriptsContextBodyActionTeam = createQuery(Script, Context, Body, Action, Team)
const shipsTransformTeamHealth = createQuery(Ship, Transform, Team, Health)

const createState = (
	body: typeof rapier.RigidBody,
	allies: Array<ShipState>,
	enemies: Array<ShipState>,
) => ({
	position: body.translation(),
	rotation: body.rotation(),
	allies,
	enemies,
})

interface ShipState {
	x: number,
	y: number,
	rotation: number,
	health: number,
	team: number,
}

export default function scriptSystem(world: World) {
	const ships: Array<Map<Entity, ShipState>> = [new Map(), new Map()]
	shipsTransformTeamHealth((e, [ship, transform, team, health]) => {
		ships[team.id].set(e, {
			x: transform.x,
			y: transform.y,
			rotation: transform.rotation,
			health: health.current,
			team: team.id,
		})
	})
	scriptsContextBodyActionTeam(async (e, [script, contextComp, bodyComp, action, team]) => {
		const body = bodyComp as typeof rapier.Body
		const context = contextComp as ivm.Context
		const allies: Array<ShipState> = []
		for (const [shipEntity, state] of ships[team.id].entries()) {
			if (shipEntity !== e) {
				allies.push(state)
			}
		}
		const enemies = [...ships[1 - team.id].values()]
		const state = createState(body, allies, enemies)
		await context.global.set('state', state, { copy: true })
		const a = await (<ivm.Script>script).run(context, { copy: true })
		action.throttle = a.throttle
		action.rotate = a.rotate
		action.fire = a.fire
	})
}