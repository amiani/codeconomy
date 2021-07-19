import { $kind, FieldKind, isField, isPrimitiveField, isSchema, } from "@javelin/core";
import { fieldToByteView, read, uint32, write, } from "./views";
function pushBufferField(out, byteView, value, length = byteView.length ?? 1) {
    const byteLength = length * byteView.byteLength;
    out.push({
        view: byteView,
        value: byteView[$kind] === FieldKind.String
            ? value.slice(0, length)
            : value,
        byteLength,
    });
    return byteLength;
}
function pushCollectionLengthField(out, length) {
    out.push({
        view: uint32,
        value: length,
        byteLength: uint32.byteLength,
    });
    return uint32.byteLength;
}
export function serialize(out, node, object, offset = 0) {
    if (isField(node)) {
        switch (node[$kind]) {
            case FieldKind.Number:
            case FieldKind.String:
            case FieldKind.Boolean:
                offset += pushBufferField(out, node, object, node.length);
                break;
            case FieldKind.Array: {
                const element = node
                    .element;
                offset += pushCollectionLengthField(out, object.length);
                for (let i = 0; i < object.length; i++) {
                    offset = serialize(out, element, object[i], offset);
                }
                break;
            }
            case FieldKind.Object: {
                const keys = Object.keys(object);
                offset += pushCollectionLengthField(out, keys.length);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    offset += pushBufferField(out, node.key, key);
                    offset = serialize(out, node.element, object[key], offset);
                }
                break;
            }
            case FieldKind.Set:
                offset += pushCollectionLengthField(out, object.size);
                object.forEach((element) => {
                    offset = serialize(out, node.element, element, offset);
                });
                break;
            case FieldKind.Map:
                offset += pushCollectionLengthField(out, object.size);
                object.forEach((element, key) => {
                    offset += pushBufferField(out, node.key, key);
                    offset = serialize(out, node
                        .element, element, offset);
                });
                break;
        }
    }
    else {
        for (let i = 0; i < node.fields.length; i++) {
            const edge = node.fields[i];
            offset = serialize(out, edge, object[node.keys[i]], offset);
        }
    }
    return offset;
}
export function encode(object, node, cursor = { offset: 0 }) {
    const bufferFields = [];
    const bufferSize = serialize(bufferFields, node, object);
    const buffer = new ArrayBuffer(bufferSize);
    const dataView = new DataView(buffer);
    for (let i = 0; i < bufferFields.length; i++) {
        const { view, value } = bufferFields[i];
        write(dataView, view, cursor, value);
    }
    return buffer;
}
function getTarget(node) {
    if (isSchema(node)) {
        return {};
    }
    else if ("element" in node) {
        switch (node[$kind]) {
            case FieldKind.Array:
                return [];
            case FieldKind.Object:
                return {};
            case FieldKind.Set:
                return new Set();
            case FieldKind.Map:
                return new Map();
            default:
                throw new Error("Unsupported collection");
        }
    }
    return null;
}
const decodeInner = (dataView, node, cursor, target = getTarget(node)) => {
    if (isSchema(node)) {
        for (let i = 0; i < node.fields.length; i++) {
            const key = node.keys[i];
            target[key] = decodeInner(dataView, node.fields[i], cursor, target[key]);
        }
        return target;
    }
    switch (node[$kind]) {
        case FieldKind.Number:
        case FieldKind.String:
        case FieldKind.Boolean: {
            return read(dataView, node, cursor, node.length);
        }
        case FieldKind.Array: {
            const length = read(dataView, uint32, cursor);
            for (let i = 0; i < length; i++) {
                ;
                target[i] = decodeInner(dataView, node.element, cursor);
            }
            return target;
        }
        case FieldKind.Object: {
            const length = read(dataView, uint32, cursor);
            for (let i = 0; i < length; i++) {
                const key = read(dataView, node.key, cursor);
                target[key] = decodeInner(dataView, node.element, cursor);
            }
            return target;
        }
        case FieldKind.Set: {
            const length = read(dataView, uint32, cursor);
            for (let i = 0; i < length; i++) {
                ;
                target.add(decodeInner(dataView, node.element, cursor));
            }
            return target;
        }
        case FieldKind.Map: {
            const length = read(dataView, uint32, cursor);
            for (let i = 0; i < length; i++) {
                const key = read(dataView, node.key, cursor);
                target.set(key, decodeInner(dataView, node.element, cursor));
            }
            return target;
        }
    }
};
export function decode(buffer, node, cursor = { offset: 0 }, target) {
    return decodeInner(new DataView(buffer), node, cursor, target);
}
export function enhanceModelInner(node) {
    if (isField(node)) {
        if (isPrimitiveField(node)) {
            Object.assign(node, fieldToByteView(node));
        }
        else {
            if ("element" in node) {
                enhanceModelInner(node.element);
            }
            if ("key" in node) {
                enhanceModelInner(node.key);
            }
        }
    }
    else {
        for (let i = 0; i < node.fields.length; i++) {
            enhanceModelInner(node.fields[i]);
        }
    }
}
export function enhanceModel(model) {
    for (const prop in model) {
        enhanceModelInner(model[prop]);
    }
    return model;
}
export * from "./views";
//# sourceMappingURL=pack.js.map