import { createTopic } from '@javelin/ecs'

interface ScriptEvent {
	uid: string,
	code: string
}
const scriptTopic = createTopic<ScriptEvent>()
export default scriptTopic