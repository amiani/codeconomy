import { Component, Entity } from "@javelin/ecs";
import { ModelEnhanced } from "@javelin/pack";
import * as Ops from "./message_op";
export declare type Message = {
    parts: MessagePart[];
    byteLength: number;
};
export declare enum MessagePartKind {
    Model = 0,
    Attach = 1,
    Snapshot = 2,
    Patch = 3,
    Detach = 4,
    Destroy = 5
}
export declare type MessagePart = {
    ops: Ops.MessageOp[];
    kind: MessagePartKind;
    byteLength: number;
};
export declare function getEnhancedModel(): ModelEnhanced;
export declare function createMessage(): Message;
export declare function createMessagePart(kind: MessagePartKind): MessagePart;
export declare function clearMessagePart(part: MessagePart): void;
export declare function getOrSetPart(message: Message, kind: MessagePartKind): MessagePart;
export declare function insert(message: Message, kind: MessagePartKind, op: Ops.MessageOp): void;
export declare function overwrite(message: Message, kind: MessagePartKind, op: Ops.MessageOp): void;
export declare function model(message: Message): void;
export declare function attach(message: Message, entity: Entity, components: Component[]): void;
export declare function snapshot(message: Message, entity: Entity, components: Component[]): void;
export declare function patch(message: Message, entity: Entity, component: Component): void;
export declare function detach(message: Message, entity: Entity, schemaIds: number[]): void;
export declare function destroy(message: Message, entity: Entity): void;
//# sourceMappingURL=message.d.ts.map