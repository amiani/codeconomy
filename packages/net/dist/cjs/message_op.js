"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = exports.destroy = exports.detach = exports.patch = exports.snapshot = exports.modify = exports.insert = exports.messageOpPool = exports.resetOp = exports.createOp = exports.$buffer = void 0;
const core_1 = require("@javelin/core");
const pack_1 = require("@javelin/pack");
const model_1 = require("./model");
exports.$buffer = Symbol("javelin_array_buffer");
function createOp() {
    return {
        data: [],
        view: [],
        byteLength: 0,
    };
}
exports.createOp = createOp;
function resetOp(op) {
    core_1.mutableEmpty(op.data);
    core_1.mutableEmpty(op.view);
    op.byteLength = 0;
    return op;
}
exports.resetOp = resetOp;
exports.messageOpPool = core_1.createStackPool(createOp, resetOp, 1000);
function insert(op, data, view) {
    op.data.push(data);
    op.view.push(view ?? exports.$buffer);
    op.byteLength += view ? view.byteLength : data.byteLength;
    return op.data.length - 1;
}
exports.insert = insert;
function modify(op, index, data) {
    const current = op.data[index];
    const view = op.view[index];
    op.data[index] = data;
    if (view === exports.$buffer) {
        op.byteLength +=
            data.byteLength - current.byteLength;
    }
}
exports.modify = modify;
/**
 * Create a snapshot message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   components: [schemaId: uint8, encoded: *][],
 * ]
 * @param entity
 * @param components
 * @returns MessageOp
 */
function snapshot(model, entity, components) {
    const op = exports.messageOpPool.retain();
    const count = components.length;
    insert(op, entity, pack_1.uint32);
    insert(op, count, pack_1.uint8);
    for (let i = 0; i < count; i++) {
        const component = components[i];
        const schemaId = component.__type__;
        const encoded = pack_1.encode(component, model[schemaId]);
        insert(op, schemaId, pack_1.uint8);
        insert(op, encoded);
    }
    return op;
}
exports.snapshot = snapshot;
function patchInner(op, node, patch, total = 0, traverse) {
    const { changes, children } = patch;
    const { size } = changes;
    if (size > 0) {
        insert(op, node.id, pack_1.uint8);
        insert(op, traverse?.length ?? 0, pack_1.uint8);
        if (traverse !== undefined) {
            for (let i = 0; i < traverse.length; i++) {
                insert(op, traverse[i][0], traverse[i][1]);
            }
        }
        insert(op, size, pack_1.uint8);
        if (core_1.isSchema(node)) {
            changes.forEach((value, key) => {
                const child = node.fieldsByKey[key];
                insert(op, child.id, pack_1.uint8);
                if (core_1.isPrimitiveField(child)) {
                    insert(op, value, child);
                }
                else {
                    insert(op, pack_1.encode(value, child));
                }
            });
        }
        else {
            core_1.assert("element" in node);
            const element = node.element;
            switch (node[core_1.$kind]) {
                case core_1.FieldKind.Array:
                    changes.forEach((value, key) => {
                        if (key === "length")
                            return;
                        insert(op, Number(key), pack_1.uint16);
                        if (core_1.isPrimitiveField(element)) {
                            insert(op, value, element);
                        }
                        else {
                            insert(op, pack_1.encode(value, element));
                        }
                    });
                    break;
            }
        }
    }
    if (!core_1.isSimple(node)) {
        if (core_1.isSchema(node)) {
            children.forEach((changes, key) => {
                total = patchInner(op, node.fieldsByKey[key], changes, total, traverse);
            });
        }
        else {
            core_1.assert("element" in node);
            const element = node.element;
            children.forEach(changes => (total = patchInner(op, element, changes, total, traverse)));
        }
    }
    return total + 1;
}
/**
 * Create a patch message op.
 * [entity, schemaId, [field, traverse, [operation, ...args]*]*]
 * @param model
 * @param entity
 * @param schemaId
 * @param patch
 * @returns MessageOp
 */
function patch(model, entity, patch) {
    const op = exports.messageOpPool.retain();
    const { schemaId } = patch;
    const root = model[schemaId];
    insert(op, entity, pack_1.uint32);
    insert(op, schemaId, pack_1.uint8);
    modify(op, insert(op, 0, pack_1.uint8), patchInner(op, root, patch));
    return op;
}
exports.patch = patch;
/**
 * Create a detach message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   schemaIds: uint8[],
 * ]
 * @param entity
 * @param schemaIds
 * @returns MessageOp
 */
function detach(entity, schemaIds) {
    const op = exports.messageOpPool.retain();
    const count = schemaIds.length;
    insert(op, entity, pack_1.uint32);
    insert(op, count, pack_1.uint8);
    for (let i = 0; i < count; i++) {
        insert(op, schemaIds[i], pack_1.uint8);
    }
    return op;
}
exports.detach = detach;
/**
 * Create a destroy message op.
 * @example
 * [
 *   entity: uint32,
 * ]
 * @param entity
 * @returns MessageOp
 */
function destroy(entity) {
    const op = exports.messageOpPool.retain();
    insert(op, entity, pack_1.uint32);
    return op;
}
exports.destroy = destroy;
/**
 * Create a model message op.
 * @example
 * [
 *   model: *,
 * ]
 * @param model
 * @returns MessageOp
 */
function model(model) {
    const op = exports.messageOpPool.retain();
    insert(op, model_1.encodeModel(model));
    return op;
}
exports.model = model;
//# sourceMappingURL=message_op.js.map