import { createTopic } from '@javelin/ecs'

interface ModuleEvent {
	uid: string,
	code: string
}
export default createTopic<ModuleEvent>()