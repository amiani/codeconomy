"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceModel = exports.enhanceModelInner = exports.decode = exports.encode = exports.serialize = void 0;
const core_1 = require("@javelin/core");
const views_1 = require("./views");
function pushBufferField(out, byteView, value, length = byteView.length ?? 1) {
    const byteLength = length * byteView.byteLength;
    out.push({
        view: byteView,
        value: byteView[core_1.$kind] === core_1.FieldKind.String
            ? value.slice(0, length)
            : value,
        byteLength,
    });
    return byteLength;
}
function pushCollectionLengthField(out, length) {
    out.push({
        view: views_1.uint32,
        value: length,
        byteLength: views_1.uint32.byteLength,
    });
    return views_1.uint32.byteLength;
}
function serialize(out, node, object, offset = 0) {
    if (core_1.isField(node)) {
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Number:
            case core_1.FieldKind.String:
            case core_1.FieldKind.Boolean:
                offset += pushBufferField(out, node, object, node.length);
                break;
            case core_1.FieldKind.Array: {
                const element = node
                    .element;
                offset += pushCollectionLengthField(out, object.length);
                for (let i = 0; i < object.length; i++) {
                    offset = serialize(out, element, object[i], offset);
                }
                break;
            }
            case core_1.FieldKind.Object: {
                const keys = Object.keys(object);
                offset += pushCollectionLengthField(out, keys.length);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    offset += pushBufferField(out, node.key, key);
                    offset = serialize(out, node.element, object[key], offset);
                }
                break;
            }
            case core_1.FieldKind.Set:
                offset += pushCollectionLengthField(out, object.size);
                object.forEach((element) => {
                    offset = serialize(out, node.element, element, offset);
                });
                break;
            case core_1.FieldKind.Map:
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
exports.serialize = serialize;
function encode(object, node, cursor = { offset: 0 }) {
    const bufferFields = [];
    const bufferSize = serialize(bufferFields, node, object);
    const buffer = new ArrayBuffer(bufferSize);
    const dataView = new DataView(buffer);
    for (let i = 0; i < bufferFields.length; i++) {
        const { view, value } = bufferFields[i];
        views_1.write(dataView, view, cursor, value);
    }
    return buffer;
}
exports.encode = encode;
function getTarget(node) {
    if (core_1.isSchema(node)) {
        return {};
    }
    else if ("element" in node) {
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Array:
                return [];
            case core_1.FieldKind.Object:
                return {};
            case core_1.FieldKind.Set:
                return new Set();
            case core_1.FieldKind.Map:
                return new Map();
            default:
                throw new Error("Unsupported collection");
        }
    }
    return null;
}
const decodeInner = (dataView, node, cursor, target = getTarget(node)) => {
    if (core_1.isSchema(node)) {
        for (let i = 0; i < node.fields.length; i++) {
            const key = node.keys[i];
            target[key] = decodeInner(dataView, node.fields[i], cursor, target[key]);
        }
        return target;
    }
    switch (node[core_1.$kind]) {
        case core_1.FieldKind.Number:
        case core_1.FieldKind.String:
        case core_1.FieldKind.Boolean: {
            return views_1.read(dataView, node, cursor, node.length);
        }
        case core_1.FieldKind.Array: {
            const length = views_1.read(dataView, views_1.uint32, cursor);
            for (let i = 0; i < length; i++) {
                ;
                target[i] = decodeInner(dataView, node.element, cursor);
            }
            return target;
        }
        case core_1.FieldKind.Object: {
            const length = views_1.read(dataView, views_1.uint32, cursor);
            for (let i = 0; i < length; i++) {
                const key = views_1.read(dataView, node.key, cursor);
                target[key] = decodeInner(dataView, node.element, cursor);
            }
            return target;
        }
        case core_1.FieldKind.Set: {
            const length = views_1.read(dataView, views_1.uint32, cursor);
            for (let i = 0; i < length; i++) {
                ;
                target.add(decodeInner(dataView, node.element, cursor));
            }
            return target;
        }
        case core_1.FieldKind.Map: {
            const length = views_1.read(dataView, views_1.uint32, cursor);
            for (let i = 0; i < length; i++) {
                const key = views_1.read(dataView, node.key, cursor);
                target.set(key, decodeInner(dataView, node.element, cursor));
            }
            return target;
        }
    }
};
function decode(buffer, node, cursor = { offset: 0 }, target) {
    return decodeInner(new DataView(buffer), node, cursor, target);
}
exports.decode = decode;
function enhanceModelInner(node) {
    if (core_1.isField(node)) {
        if (core_1.isPrimitiveField(node)) {
            Object.assign(node, views_1.fieldToByteView(node));
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
exports.enhanceModelInner = enhanceModelInner;
function enhanceModel(model) {
    for (const prop in model) {
        enhanceModelInner(model[prop]);
    }
    return model;
}
exports.enhanceModel = enhanceModel;
__exportStar(require("./views"), exports);
//# sourceMappingURL=pack.js.map