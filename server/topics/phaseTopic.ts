import { createTopic } from "@javelin/ecs";
import { Phase } from "../../common/types";

interface PhaseEvent {
	phase: Phase
}

export default createTopic<PhaseEvent>()