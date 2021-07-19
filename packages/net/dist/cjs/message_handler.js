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
exports.createMessageHandler = void 0;
const core_1 = require("@javelin/core");
const ecs_1 = require("@javelin/ecs");
const Pack = __importStar(require("@javelin/pack"));
const message_1 = require("./message");
const model_1 = require("./model");
const createMessageHandler = (world) => {
    let model;
    const state = { updated: new Set() };
    const cursor = { offset: 0 };
    const entities = new Map();
    const traverse = [];
    const messages = [];
    function decodeModelPart(dataView, end, cursor) {
        model = Pack.enhanceModel(model_1.decodeModel(dataView, cursor, end - cursor.offset));
    }
    function findOrCreateLocalEntity(entityRemote) {
        let entityLocal = entities.get(entityRemote);
        if (entityLocal === undefined) {
            entityLocal = world.create();
            entities.set(entityRemote, entityLocal);
        }
        return entityLocal;
    }
    function decodeAttachPart(dataView, end, cursor) {
        const { buffer } = dataView;
        while (cursor.offset < end) {
            const toAttach = [];
            const entityRemote = Pack.read(dataView, Pack.uint32, cursor);
            const entityLocal = findOrCreateLocalEntity(entityRemote);
            const count = Pack.read(dataView, Pack.uint8, cursor);
            for (let i = 0; i < count; i++) {
                const schemaId = Pack.read(dataView, Pack.uint8, cursor);
                let local = null;
                try {
                    local = world.storage.getComponentBySchemaId(entityLocal, schemaId);
                }
                catch { }
                if (local === null) {
                    const remote = Pack.decode(buffer, model[schemaId], cursor);
                    remote.__type__ = schemaId;
                    toAttach.push(remote);
                }
                else {
                    Pack.decode(buffer, model[schemaId], cursor, local);
                }
            }
            if (toAttach.length > 0) {
                world.attachImmediate(entityLocal, toAttach);
            }
            state.updated.add(entityLocal);
        }
    }
    function decodeSnapshotPart(dataView, end, cursor) {
        const { buffer } = dataView;
        while (cursor.offset < end) {
            const entityRemote = Pack.read(dataView, Pack.uint32, cursor);
            const entityLocal = findOrCreateLocalEntity(entityRemote);
            const count = Pack.read(dataView, Pack.uint8, cursor);
            for (let i = 0; i < count; i++) {
                const schemaId = Pack.read(dataView, Pack.uint8, cursor);
                let component = null;
                try {
                    component = world.storage.getComponentBySchemaId(entityLocal, schemaId);
                }
                catch { }
                Pack.decode(buffer, model[schemaId], cursor, component ?? undefined);
            }
            state.updated.add(entityLocal);
        }
    }
    function decodePatchPart(dataView, end, cursor) {
        while (cursor.offset < end) {
            const entityRemote = Pack.read(dataView, Pack.uint32, cursor);
            const entityLocal = findOrCreateLocalEntity(entityRemote);
            const schemaId = Pack.read(dataView, Pack.uint8, cursor);
            let component;
            try {
                component = world.storage.getComponentBySchemaId(entityLocal, schemaId);
            }
            catch {
                component = null;
            }
            const total = Pack.read(dataView, Pack.uint8, cursor);
            const flat = model[core_1.$flat][schemaId];
            for (let i = 0; i < total; i++) {
                const node = flat[Pack.read(dataView, Pack.uint8, cursor)];
                const traverseLength = Pack.read(dataView, Pack.uint8, cursor);
                core_1.mutableEmpty(traverse);
                for (let j = 0; j < traverseLength; j++) {
                    traverse.push(Pack.read(dataView, node.traverse[j], cursor));
                }
                const object = component
                    ? ecs_1.getFieldValue(flat[0], component, node.id, traverse)
                    : null;
                const size = Pack.read(dataView, Pack.uint8, cursor);
                if (core_1.isSchema(node)) {
                    for (let j = 0; j < size; j++) {
                        const fieldId = Pack.read(dataView, Pack.uint8, cursor);
                        const field = flat[fieldId];
                        const key = node.keysByFieldId[fieldId];
                        const value = core_1.isPrimitiveField(field)
                            ? Pack.read(dataView, field, cursor)
                            : Pack.decode(dataView.buffer, field);
                        if (object !== null)
                            object[key] = value;
                    }
                }
                else {
                    core_1.assert("element" in node);
                    const element = node.element;
                    const primitive = core_1.isPrimitiveField(element);
                    switch (node[core_1.$kind]) {
                        case core_1.FieldKind.Array:
                            for (let j = 0; j < size; j++) {
                                const index = Pack.read(dataView, Pack.uint16, cursor);
                                const value = primitive
                                    ? Pack.read(dataView, element, cursor)
                                    : Pack.decode(dataView.buffer, element, cursor);
                                if (object !== null)
                                    object[index] = value;
                            }
                            break;
                    }
                }
            }
            state.updated.add(entityLocal);
        }
    }
    function decodeDetachPart(dataView, end, cursor) {
        while (cursor.offset < end) {
            const schemaIds = [];
            const entityRemote = Pack.read(dataView, Pack.uint32, cursor);
            const entityLocal = findOrCreateLocalEntity(entityRemote);
            const count = Pack.read(dataView, Pack.uint8, cursor);
            for (let i = 0; i < count; i++) {
                const schemaId = Pack.read(dataView, Pack.uint8, cursor);
                schemaIds.push(schemaId);
            }
            world.detachImmediate(entityLocal, schemaIds);
        }
    }
    function decodeDestroyPart(dataView, end, cursor) {
        while (cursor.offset < end) {
            const entityRemote = Pack.read(dataView, Pack.uint32, cursor);
            const entityLocal = findOrCreateLocalEntity(entityRemote);
            world.destroyImmediate(entityLocal);
        }
    }
    function decode(message) {
        cursor.offset = 0;
        const messageLength = message.byteLength;
        const dataView = new DataView(message);
        while (cursor.offset < messageLength) {
            const partKind = Pack.read(dataView, Pack.uint8, cursor);
            const partLength = Pack.read(dataView, Pack.uint32, cursor);
            const partEnd = cursor.offset + partLength;
            switch (partKind) {
                case message_1.MessagePartKind.Model:
                    decodeModelPart(dataView, partEnd, cursor);
                    break;
                case message_1.MessagePartKind.Attach:
                    decodeAttachPart(dataView, partEnd, cursor);
                    break;
                case message_1.MessagePartKind.Snapshot:
                    decodeSnapshotPart(dataView, partEnd, cursor);
                    break;
                case message_1.MessagePartKind.Patch:
                    decodePatchPart(dataView, partEnd, cursor);
                    break;
                case message_1.MessagePartKind.Detach:
                    decodeDetachPart(dataView, partEnd, cursor);
                    break;
                case message_1.MessagePartKind.Destroy:
                    decodeDestroyPart(dataView, partEnd, cursor);
                    break;
            }
        }
    }
    const push = (message) => messages.unshift(message);
    const system = () => {
        let message;
        state.updated.clear();
        while ((message = messages.pop())) {
            decode(message);
        }
    };
    const useInfo = ecs_1.createEffect(() => () => state, {
        shared: true,
    });
    return {
        push,
        system,
        useInfo,
    };
};
exports.createMessageHandler = createMessageHandler;
//# sourceMappingURL=message_handler.js.map