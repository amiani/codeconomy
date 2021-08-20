import { createTopic } from "@javelin/ecs";
import { GamePhase } from "../effects/usePhase";

interface PhaseEvent {
	phase: GamePhase
}

export default createTopic<PhaseEvent>()