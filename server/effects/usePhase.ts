import { createEffect, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { phaseTopic } from "../topics";

export enum GamePhase {
	setup,
	run,
	end,
	cleanup
}

export default createEffect((world: World<Clock>) => {
	let phase = GamePhase.setup
	const setPhase = (p: GamePhase) => {
		phase = p
		phaseTopic.push({ phase })
	}

	return () => ({
		phase,
		changePhase: setPhase
	})
})