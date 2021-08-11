import { createTopic } from '@javelin/ecs'

interface ScriptEvent {
	uid: string,
	code: string
}
export default createTopic<ScriptEvent>()