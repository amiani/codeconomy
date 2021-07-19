import { createPatch, UNSAFE_internals, UNSAFE_modelChanged, } from "@javelin/ecs";
import { enhanceModel, uint32, uint8 } from "@javelin/pack";
import * as Ops from "./message_op";
export var MessagePartKind;
(function (MessagePartKind) {
    MessagePartKind[MessagePartKind["Model"] = 0] = "Model";
    MessagePartKind[MessagePartKind["Attach"] = 1] = "Attach";
    MessagePartKind[MessagePartKind["Snapshot"] = 2] = "Snapshot";
    MessagePartKind[MessagePartKind["Patch"] = 3] = "Patch";
    MessagePartKind[MessagePartKind["Detach"] = 4] = "Detach";
    MessagePartKind[MessagePartKind["Destroy"] = 5] = "Destroy";
})(MessagePartKind || (MessagePartKind = {}));
let enhancedModel = enhanceModel(UNSAFE_internals.model);
UNSAFE_modelChanged.subscribe(model => (enhancedModel = enhanceModel(model)));
export function getEnhancedModel() {
    return enhancedModel;
}
export function createMessage() {
    return {
        parts: [],
        byteLength: 0,
    };
}
export function createMessagePart(kind) {
    return {
        ops: [],
        kind,
        byteLength: 0,
    };
}
export function clearMessagePart(part) {
    let op;
    while ((op = part.ops.pop())) {
        Ops.messageOpPool.release(op);
    }
    part.byteLength = 0;
}
export function getOrSetPart(message, kind) {
    let part = message.parts[kind];
    if (part === undefined) {
        part = createMessagePart(kind);
        message.parts[kind] = part;
        message.byteLength += uint8.byteLength + uint32.byteLength; // kind + length
    }
    return part;
}
export function insert(message, kind, op) {
    if (op.byteLength === 0) {
        return;
    }
    const part = getOrSetPart(message, kind);
    part.ops.push(op);
    part.byteLength += op.byteLength;
    message.byteLength += op.byteLength;
}
export function overwrite(message, kind, op) {
    const part = getOrSetPart(message, kind);
    message.byteLength -= part.byteLength;
    clearMessagePart(part);
    insert(message, kind, op);
}
export function model(message) {
    overwrite(message, MessagePartKind.Model, Ops.model(enhancedModel));
}
export function attach(message, entity, components) {
    insert(message, MessagePartKind.Attach, Ops.snapshot(enhancedModel, entity, components));
}
export function snapshot(message, entity, components) {
    insert(message, MessagePartKind.Snapshot, Ops.snapshot(enhancedModel, entity, components));
}
export function patch(message, entity, component) {
    insert(message, MessagePartKind.Patch, Ops.patch(enhancedModel, entity, createPatch(component)));
}
export function detach(message, entity, schemaIds) {
    insert(message, MessagePartKind.Destroy, Ops.detach(entity, schemaIds));
}
export function destroy(message, entity) {
    insert(message, MessagePartKind.Destroy, Ops.destroy(entity));
}
//# sourceMappingURL=message.js.map