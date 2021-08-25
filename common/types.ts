export enum MessageType {
	Init,
	Attach,
	Update,
	Info,
}

export interface Header {
	tick: number;
	type: MessageType;
}

export interface Packet {
	header: Header,
	message: ArrayBuffer
}