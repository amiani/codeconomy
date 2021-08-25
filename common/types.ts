export enum MessageType {
	Attach,
	Update,
}

export interface Header {
	tick: number;
	type: MessageType;
}

export interface Packet {
	header: Header,
	message: ArrayBuffer
}