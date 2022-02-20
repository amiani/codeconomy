import { component, createEffect, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { Phase } from "../../common/types";
import { GamePhase } from "../components";
import { phaseTopic } from "../topics";


export default createEffect((world: World<Clock>) => {
	const phaseComp = component(GamePhase, { phase: Phase.setup });
	world.create(phaseComp)
	//let phase = GamePhase.setup
	const setPhase = (p: Phase) => {
		phaseComp.phase = p
		phaseTopic.push({ phase: phaseComp.phase })
	}

	return () => ({
		phaseComp,
		changePhase: setPhase
	})
})