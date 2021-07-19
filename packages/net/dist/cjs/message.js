"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.detach = exports.patch = exports.snapshot = exports.attach = exports.model = exports.overwrite = exports.insert = exports.getOrSetPart = exports.clearMessagePart = exports.createMessagePart = exports.createMessage = exports.getEnhancedModel = exports.MessagePartKind = void 0;
const ecs_1 = require("@javelin/ecs");
const pack_1 = require("@javelin/pack");
const Ops = __importStar(require("./message_op"));
var MessagePartKind;
(function (MessagePartKind) {
    MessagePartKind[MessagePartKind["Model"] = 0] = "Model";
    MessagePartKind[MessagePartKind["Attach"] = 1] = "Attach";
    MessagePartKind[MessagePartKind["Snapshot"] = 2] = "Snapshot";
    MessagePartKind[MessagePartKind["Patch"] = 3] = "Patch";
    MessagePartKind[MessagePartKind["Detach"] = 4] = "Detach";
    MessagePartKind[MessagePartKind["Destroy"] = 5] = "Destroy";
})(MessagePartKind = exports.MessagePartKind || (exports.MessagePartKind = {}));
let enhancedModel = pack_1.enhanceModel(ecs_1.UNSAFE_internals.model);
ecs_1.UNSAFE_modelChanged.subscribe(model => (enhancedModel = pack_1.enhanceModel(model)));
function getEnhancedModel() {
    return enhancedModel;
}
exports.getEnhancedModel = getEnhancedModel;
function createMessage() {
    return {
        parts: [],
        byteLength: 0,
    };
}
exports.createMessage = createMessage;
function createMessagePart(kind) {
    return {
        ops: [],
        kind,
        byteLength: 0,
    };
}
exports.createMessagePart = createMessagePart;
function clearMessagePart(part) {
    let op;
    while ((op = part.ops.pop())) {
        Ops.messageOpPool.release(op);
    }
    part.byteLength = 0;
}
exports.clearMessagePart = clearMessagePart;
function getOrSetPart(message, kind) {
    let part = message.parts[kind];
    if (part === undefined) {
        part = createMessagePart(kind);
        message.parts[kind] = part;
        message.byteLength += pack_1.uint8.byteLength + pack_1.uint32.byteLength; // kind + length
    }
    return part;
}
exports.getOrSetPart = getOrSetPart;
function insert(message, kind, op) {
    if (op.byteLength === 0) {
        return;
    }
    const part = getOrSetPart(message, kind);
    part.ops.push(op);
    part.byteLength += op.byteLength;
    message.byteLength += op.byteLength;
}
exports.insert = insert;
function overwrite(message, kind, op) {
    const part = getOrSetPart(message, kind);
    message.byteLength -= part.byteLength;
    clearMessagePart(part);
    insert(message, kind, op);
}
exports.overwrite = overwrite;
function model(message) {
    overwrite(message, MessagePartKind.Model, Ops.model(enhancedModel));
}
exports.model = model;
function attach(message, entity, components) {
    insert(message, MessagePartKind.Attach, Ops.snapshot(enhancedModel, entity, components));
}
exports.attach = attach;
function snapshot(message, entity, components) {
    insert(message, MessagePartKind.Snapshot, Ops.snapshot(enhancedModel, entity, components));
}
exports.snapshot = snapshot;
function patch(message, entity, component) {
    insert(message, MessagePartKind.Patch, Ops.patch(enhancedModel, entity, ecs_1.createPatch(component)));
}
exports.patch = patch;
function detach(message, entity, schemaIds) {
    insert(message, MessagePartKind.Destroy, Ops.detach(entity, schemaIds));
}
exports.detach = detach;
function destroy(message, entity) {
    insert(message, MessagePartKind.Destroy, Ops.destroy(entity));
}
exports.destroy = destroy;
//# sourceMappingURL=message.js.map