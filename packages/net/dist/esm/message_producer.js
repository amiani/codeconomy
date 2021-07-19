import { createPatch, resetPatch, UNSAFE_internals, } from "@javelin/ecs";
import { createEntityMap } from "./entity_map";
import EntityPriorityQueue from "./entity_priority_queue";
import * as Message from "./message";
import * as MessageOp from "./message_op";
export function createMessageProducer(options = {}) {
    const { maxByteLength = Infinity } = options;
    let previousModel = null;
    const queue = [Message.createMessage()];
    const entityPriorities = new EntityPriorityQueue();
    const entityUpdates = createEntityMap();
    const entityPatches = createEntityMap();
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
        entityPatches[entity] = createPatch(component, entityPatches[entity]);
        amplify(entity, priority);
    }
    function detach(entity, components) {
        enqueue(MessageOp.detach(entity, components.map(c => c.__type__)), Message.MessagePartKind.Detach);
    }
    function destroy(entity) {
        enqueue(MessageOp.destroy(entity), Message.MessagePartKind.Destroy);
        entityPriorities.remove(entity);
    }
    function take(includeModel = previousModel !== UNSAFE_internals.model) {
        const message = queue.pop() || Message.createMessage();
        if (includeModel) {
            Message.model(message);
            previousModel = UNSAFE_internals.model;
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
                resetPatch(patch);
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
//# sourceMappingURL=message_producer.js.map