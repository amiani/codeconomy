import { createTopic } from "@javelin/ecs";

export enum LogType {
	Info,
	Error,
}
	
interface LogEvent {
	type: LogType;
	message: string;
}

export default createTopic<LogEvent>()