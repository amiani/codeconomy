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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageProducer = void 0;
const ecs_1 = require("@javelin/ecs");
const entity_map_1 = require("./entity_map");
const entity_priority_queue_1 = __importDefault(require("./entity_priority_queue"));
const Message = __importStar(require("./message"));
const MessageOp = __importStar(require("./message_op"));
function createMessageProducer(options = {}) {
    const { maxByteLength = Infinity } = options;
    let previousModel = null;
    const queue = [Message.createMessage()];
    const entityPriorities = new entity_priority_queue_1.default();
    const entityUpdates = entity_map_1.createEntityMap();
    const entityPatches = entity_map_1.createEntityMap();
    function amplify(entity, priority) {
        const current = entityPriorities.getPriority(entity) ?? 0;
        entityPriorities.changePriority(entity, current + priority);
    }
    function enqueue(op, kind) {
        let message = queue[0];
        if (message === undefined ||
            op.byteLength + message.byteLength > maxByteLength) {
            message = Message.createMessage();
            queue.unshift(message);
        }
        Message.insert(message, kind, op);
        return message;
    }
    function attach(entity, components) {
        enqueue(MessageOp.snapshot(Message.getEnhancedModel(), entity, components), Message.MessagePartKind.Attach);
    }
    function update(entity, components, priority = 1) {
        let updates = entityUpdates[entity];
        if (updates === undefined) {
            updates = entityUpdates[entity] = new Map();
        }
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            updates.set(component.__type__, component);
        }
        amplify(entity, priority);
    }
    function patch(entity, component, priority = 1) {
        entityPatches[entity] = ecs_1.createPatch(component, entityPatches[entity]);
        amplify(entity, priority);
    }
    function detach(entity, components) {
        enqueue(MessageOp.detach(entity, components.map(c => c.__type__)), Message.MessagePartKind.Detach);
    }
    function destroy(entity) {
        enqueue(MessageOp.destroy(entity), Message.MessagePartKind.Destroy);
        entityPriorities.remove(entity);
    }
    function take(includeModel = previousModel !== ecs_1.UNSAFE_internals.model) {
        const message = queue.pop() || Message.createMessage();
        if (includeModel) {
            Message.model(message);
            previousModel = ecs_1.UNSAFE_internals.model;
        }
        while (true) {
            const entity = entityPriorities.poll();
            if (entity === null || entity === undefined) {
                break;
            }
            const update = entityUpdates[entity];
            const patch = entityPatches[entity];
            const model = Message.getEnhancedModel();
            if (update && update.size > 0) {
                const components = Array.from(update.values());
                const op = MessageOp.snapshot(model, entity, components);
                if (op.byteLength + message?.byteLength >= maxByteLength) {
                    break;
                }
                Message.insert(message, Message.MessagePartKind.Snapshot, op);
                update.clear();
            }
            if (patch && (patch.changes.size > 0 || patch.children.size > 0)) {
                const op = MessageOp.patch(model, entity, patch);
                if (op.byteLength + message?.byteLength >= maxByteLength) {
                    break;
                }
                Message.insert(message, Message.MessagePartKind.Patch, op);
                ecs_1.resetPatch(patch);
            }
        }
        return message;
    }
    return {
        amplify,
        attach,
        update,
        patch,
        detach,
        destroy,
        take,
    };
}
exports.createMessageProducer = createMessageProducer;
//# sourceMappingURL=message_producer.js.map