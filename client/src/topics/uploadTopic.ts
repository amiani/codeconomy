import { createTopic } from "@javelin/ecs";

interface UploadEvent {
	code: string
}

export default createTopic<UploadEvent>()