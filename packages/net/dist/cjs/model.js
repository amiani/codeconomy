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
exports.decodeModel = exports.decodeField = exports.encodeModel = void 0;
const Core = __importStar(require("@javelin/core"));
const Pack = __importStar(require("@javelin/pack"));
const BYTE_VIEWS = [
    Pack.uint8,
    Pack.uint16,
    Pack.uint32,
    Pack.int8,
    Pack.int16,
    Pack.int32,
    Pack.float32,
    Pack.float64,
    Pack.string8,
    Pack.string16,
    Pack.boolean,
];
const BYTE_VIEWS_LOOKUP = BYTE_VIEWS.reduce((sparse, byteView) => {
    sparse[byteView[Pack.$byteView]] = byteView;
    return sparse;
}, []);
const COLLECTION_MASK = 1 << 6;
const SCHEMA_MASK = 1 << 7;
function encodeField(byteView, out, offset = 0) {
    out.push(byteView[Pack.$byteView]);
    offset++;
    if (byteView[Core.$kind] === Core.FieldKind.String) {
        out.push(byteView.length ?? 0);
        offset++;
    }
    return offset;
}
function encodeNode(node, out, offset = 0) {
    if (Core.isField(node)) {
        if (Core.isPrimitiveField(node)) {
            offset = encodeField(node, out, offset);
        }
        else {
            out.push(node[Core.$kind] | COLLECTION_MASK);
            offset++;
            if ("key" in node) {
                offset = encodeField(node.key, out, offset);
            }
            offset = encodeNode(node.element, out, offset);
        }
    }
    else {
        const length = node.fields.length;
        out.push(length | SCHEMA_MASK);
        offset++;
        for (let i = 0; i < length; i++) {
            const key = node.keys[i];
            out.push(key.length);
            offset++;
            for (let i = 0; i < key.length; i++) {
                out.push(key.charCodeAt(i));
                offset++;
            }
            offset = encodeNode(node.fields[i], out, offset);
        }
    }
    return offset;
}
function encodeModel(model) {
    const flat = [];
    let size = 0;
    for (const prop in model) {
        flat.push(+prop);
        size += encodeNode(model[prop], flat) + 1;
    }
    const buffer = new ArrayBuffer(size);
    const encoded = new Uint8Array(buffer);
    for (let i = 0; i < flat.length; i++) {
        encoded[i] = flat[i];
    }
    return buffer;
}
exports.encodeModel = encodeModel;
function decodeField(encoded, cursor) {
    const dataTypeId = encoded[cursor.offset++];
    let child;
    if ((dataTypeId & SCHEMA_MASK) !== 0) {
        let length = dataTypeId & ~SCHEMA_MASK;
        child = {};
        while (length-- > 0) {
            let keySize = encoded[cursor.offset++];
            let key = "";
            while (keySize-- > 0) {
                key += String.fromCharCode(encoded[cursor.offset++]);
            }
            child[key] = decodeField(encoded, cursor);
        }
    }
    else if ((dataTypeId & COLLECTION_MASK) !== 0) {
        const collectionType = dataTypeId & ~COLLECTION_MASK;
        switch (collectionType) {
            case Core.FieldKind.Array:
                child = Core.arrayOf(decodeField(encoded, cursor));
                break;
            case Core.FieldKind.Object: {
                const key = decodeField(encoded, cursor);
                child = Core.objectOf(decodeField(encoded, cursor), key);
                break;
            }
            case Core.FieldKind.Set:
                child = Core.setOf(decodeField(encoded, cursor));
                break;
            case Core.FieldKind.Map:
                child = Core.mapOf(decodeField(encoded, cursor), decodeField(encoded, cursor));
                break;
            default:
                child = Core.dynamic();
                break;
        }
    }
    else {
        child = BYTE_VIEWS_LOOKUP[dataTypeId];
        if (Pack.isStringView(child)) {
            child = { ...child, length: encoded[cursor.offset++] };
        }
    }
    return child;
}
exports.decodeField = decodeField;
function decodeModel(dataView, cursor, length) {
    const config = new Map();
    const encoded = new Uint8Array(dataView.buffer);
    while (cursor.offset < length) {
        const schemaId = encoded[cursor.offset++];
        const schema = decodeField(encoded, cursor);
        config.set(schemaId, schema);
    }
    return Core.createModel(config);
}
exports.decodeModel = decodeModel;
//# sourceMappingURL=model.js.map