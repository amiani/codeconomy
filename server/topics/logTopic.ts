import { createTopic, Entity } from "@javelin/ecs";

export enum LogType {
	Info,
	Error,
}
	
interface LogEvent {
	type: LogType;
	toEntity: Entity;
	message: string;
}

export default createTopic<LogEvent>()