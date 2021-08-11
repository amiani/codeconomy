import { createTopic } from "@javelin/ecs";

interface LaserEvent {
	position: { x: number, y: number }
}

export default createTopic<LaserEvent>()