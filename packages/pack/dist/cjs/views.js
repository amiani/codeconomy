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
exports.fieldToByteView = exports.string = exports.number = exports.boolean = exports.string16 = exports.string8 = exports.float64 = exports.float32 = exports.int32 = exports.int16 = exports.int8 = exports.uint32 = exports.uint16 = exports.uint8 = exports.write = exports.read = exports.isStringView = exports.isByteView = exports.ByteViewKind = exports.$byteView = void 0;
const Model = __importStar(require("@javelin/core"));
const core_1 = require("@javelin/core");
exports.$byteView = Symbol("javelin_byte_view");
var ByteViewKind;
(function (ByteViewKind) {
    ByteViewKind[ByteViewKind["Uint8"] = 0] = "Uint8";
    ByteViewKind[ByteViewKind["Uint16"] = 1] = "Uint16";
    ByteViewKind[ByteViewKind["Uint32"] = 2] = "Uint32";
    ByteViewKind[ByteViewKind["Int8"] = 3] = "Int8";
    ByteViewKind[ByteViewKind["Int16"] = 4] = "Int16";
    ByteViewKind[ByteViewKind["Int32"] = 5] = "Int32";
    ByteViewKind[ByteViewKind["Float32"] = 6] = "Float32";
    ByteViewKind[ByteViewKind["Float64"] = 7] = "Float64";
    ByteViewKind[ByteViewKind["String8"] = 8] = "String8";
    ByteViewKind[ByteViewKind["String16"] = 9] = "String16";
    ByteViewKind[ByteViewKind["Boolean"] = 10] = "Boolean";
})(ByteViewKind = exports.ByteViewKind || (exports.ByteViewKind = {}));
function isByteView(object) {
    return Model.isField(object) && "byteLength" in object;
}
exports.isByteView = isByteView;
function isStringView(object) {
    return isByteView(object) && object[core_1.$kind] === Model.FieldKind.String;
}
exports.isStringView = isStringView;
function read(dataView, byteView, cursor, length = byteView.length ?? 1) {
    const data = byteView.read(dataView, cursor.offset, length);
    cursor.offset += byteView.byteLength * length;
    return data;
}
exports.read = read;
function write(dataView, byteView, cursor, data) {
    const length = byteView.length ?? 1;
    byteView.write(dataView, cursor.offset, data);
    cursor.offset += byteView.byteLength * length;
}
exports.write = write;
function createByteView(kind, field, byteLength, read, write) {
    return {
        ...field,
        [exports.$byteView]: kind,
        byteLength,
        read,
        write,
    };
}
exports.uint8 = createByteView(ByteViewKind.Uint8, Model.number, 1, (dataView, offset) => dataView.getUint8(offset), (dataView, offset, data) => dataView.setUint8(offset, data));
exports.uint16 = createByteView(ByteViewKind.Uint16, Model.number, 2, (dataView, offset) => dataView.getUint16(offset), (dataView, offset, data) => dataView.setUint16(offset, data));
exports.uint32 = createByteView(ByteViewKind.Uint32, Model.number, 4, (dataView, offset) => dataView.getUint32(offset), (dataView, offset, data) => dataView.setUint32(offset, data));
exports.int8 = createByteView(ByteViewKind.Int8, Model.number, 1, (dataView, offset) => dataView.getInt8(offset), (dataView, offset, data) => dataView.setInt8(offset, data));
exports.int16 = createByteView(ByteViewKind.Int16, Model.number, 2, (dataView, offset) => dataView.getInt16(offset), (dataView, offset, data) => dataView.setInt16(offset, data));
exports.int32 = createByteView(ByteViewKind.Int32, Model.number, 4, (dataView, offset) => dataView.getInt32(offset), (dataView, offset, data) => dataView.setInt32(offset, data));
exports.float32 = createByteView(ByteViewKind.Float32, Model.number, 4, (dataView, offset) => dataView.getFloat32(offset), (dataView, offset, data) => dataView.setFloat32(offset, data));
exports.float64 = createByteView(ByteViewKind.Float64, Model.number, 8, (dataView, offset) => dataView.getFloat64(offset), (dataView, offset, data) => dataView.setFloat64(offset, data));
exports.string8 = createByteView(ByteViewKind.String8, Model.string, 1, (dataView, offset, length = 0) => {
    let value = "";
    for (let i = 0; i < length; i++) {
        const charCode = dataView.getUint8(offset);
        if (charCode === 0) {
            break;
        }
        value += String.fromCharCode(charCode);
        offset++;
    }
    return value;
}, (dataView, offset, data) => {
    for (let j = 0; j < data.length; j++) {
        dataView.setUint8(offset, data[j].charCodeAt(0));
        offset++;
    }
});
exports.string16 = createByteView(ByteViewKind.String16, Model.string, 2, (dataView, offset, length = 0) => {
    let value = "";
    for (let i = 0; i < length; i++) {
        const charCode = dataView.getUint16(offset);
        if (charCode === 0) {
            break;
        }
        value += String.fromCharCode(charCode);
        offset += exports.string16.byteLength;
    }
    return value;
}, (dataView, offset, data) => {
    for (let j = 0; j < data.length; j++) {
        dataView.setUint16(offset, data[j].charCodeAt(0));
        offset += exports.string16.byteLength;
    }
});
exports.boolean = createByteView(ByteViewKind.Boolean, Model.boolean, exports.uint8.byteLength, (dataView, offset) => !!exports.uint8.read(dataView, offset), (dataView, offset, value) => exports.uint8.write(dataView, offset, +value));
exports.number = exports.float64;
exports.string = exports.string16;
function fieldToByteView(field) {
    if (isByteView(field)) {
        return field;
    }
    switch (field[core_1.$kind]) {
        case Model.FieldKind.Number:
        case Model.FieldKind.Dynamic:
            return exports.number;
        case Model.FieldKind.String:
            return exports.string;
        case Model.FieldKind.Boolean:
            return exports.boolean;
    }
    throw new Error(`Failed to find dataView: unsupported field "${field[core_1.$kind]}"`);
}
exports.fieldToByteView = fieldToByteView;
//# sourceMappingURL=views.js.map