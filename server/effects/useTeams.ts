import { createEffect, Entity, World } from "@javelin/ecs";
import { MAX_PLAYERS } from "../env";

export default createEffect((world: World) => {
	const teams = Array<Entity>(MAX_PLAYERS+1).fill(-1)
	const assign = (player: Entity) => {
		const index = teams.findIndex(t => t == -1)
		teams[index] = player
		return index
	}
	const remove = (player: Entity) => {
		const index = teams.findIndex(t => t == player)
		teams[index] = -1
	}

	return () => ({
		assign,
		remove
	})
}, { shared: true })